from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os
import shutil
import uuid
from dotenv import load_dotenv
import pathlib
from app.db.database import SessionLocal
from app.schemas.error import ErrorCreate, ErrorResponse, ErrorImageResponse
from app.models.error import Error, ErrorImage
from app.core.security import get_current_active_admin, get_current_active_user
# Removed admin log import and logging calls as per user request
# from app.api.admin_log import log_admin_action
from fastapi import Request
from app.models.user import User

load_dotenv()

import logging
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploaded_images")
ABS_UPLOAD_DIR = os.path.abspath(UPLOAD_DIR)
logging.info(f"Using absolute upload directory: {ABS_UPLOAD_DIR}")
pathlib.Path(ABS_UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

router = APIRouter()

from app.db.database import get_db

@router.post("/", response_model=ErrorResponse, status_code=status.HTTP_201_CREATED)
async def create_error_with_files(
    request: Request,
    name: str = Form(...),
    description: Optional[str] = Form(None),
    solution_description: Optional[str] = Form(None),
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_admin)
):
    import traceback
    import logging
    import uuid
    import os
    import shutil
    from fastapi import HTTPException

    try:
        # Проверка существования ошибки
        db_error = db.query(Error).filter(Error.name == name).first()
        if db_error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ошибка с таким именем уже существует"
            )

        # Создание новой ошибки
        db_error = Error(name=name, description=description, solution_description=solution_description)
        db.add(db_error)
        db.commit()
        db.refresh(db_error)

        # Логирование создания ошибки
    # log_admin_action(db, request=request, action=f"Создана ошибка: {name}")

        # Обработка файлов
        for file in files:
            if file.content_type not in ["image/png", "image/jpeg", "image/jpg"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid image type. Only PNG and JPG are allowed."
                )

            # Сохранение файла
            import logging
            import re
            # Sanitize filename: replace spaces and non-alphanumeric chars with underscore
            safe_filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', file.filename)
            filename = f"{uuid.uuid4().hex}_{safe_filename}"
            file_path = os.path.join(ABS_UPLOAD_DIR, filename)
            logging.info(f"Saving file to {file_path}")
            try:
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                logging.info(f"File saved successfully: {file_path}")
            except Exception as e:
                logging.error(f"Error saving file {file_path}: {e}")
                raise

            # Создание записи об изображении
            db_image = ErrorImage(
                error_id=db_error.id,
                image_url=f"/uploaded_images/{filename}"
            )
            db.add(db_image)

        db.commit()
        
        return db_error
        
    except HTTPException as http_exc:
        raise  # Перебрасываем уже обработанные HTTP исключения
        
    except Exception as e:
        logging.error("Ошибка при сохранении ошибки: %s", e)
        logging.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/", response_model=list[ErrorResponse])
def read_errors(db: Session = Depends(get_db)):
    errors = db.query(Error).all()
    return errors

@router.put("/{error_id}", response_model=ErrorResponse)
async def update_error(error_id: int, error: ErrorCreate, db: Session = Depends(get_db), request: Request = None, current_user=Depends(get_current_active_admin)):
    db_error = db.query(Error).filter(Error.id == error_id).first()
    if not db_error:
        raise HTTPException(status_code=404, detail="Ошибка не найдена")
    db_error.name = error.name
    db_error.description = error.description
    db_error.solution_description = error.solution_description
    db.commit()
    db.refresh(db_error)

    # Логирование обновления ошибки с указанием администратора
    # log_admin_action(db, current_user=current_user, request=request, action=f"Обновлена ошибка: {db_error.name}")

    # Обновление изображений
    if error.images is not None:
        # Удаляем старые изображения и файлы
        old_images = db.query(ErrorImage).filter(ErrorImage.error_id == error_id).all()
        for img in old_images:
            # Удаляем файл с диска
            file_path = img.image_url.lstrip('/')
            if os.path.exists(file_path):
                os.remove(file_path)
        db.query(ErrorImage).filter(ErrorImage.error_id == error_id).delete()
        # Добавляем новые
        for image_url in error.images:
            db_image = ErrorImage(error_id=error_id, image_url=image_url)
            db.add(db_image)
        db.commit()
   
    return db_error

@router.delete("/{error_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_error(
    error_id: int,
    db: Session = Depends(get_db),
    request: Request = None,
    current_user=Depends(get_current_active_admin)
):
    db_error = db.query(Error).filter(Error.id == error_id).first()
    if not db_error:
        raise HTTPException(status_code=404, detail="Ошибка не найдена")

    # Логирование удаления ошибки
    # log_admin_action(db, request=request, action=f"Удалена ошибка: {db_error.name}")

    # Удаляем связанные изображения и файлы
    images = db.query(ErrorImage).filter(ErrorImage.error_id == error_id).all()
    for img in images:
        file_path = img.image_url.lstrip('/')
        if os.path.exists(file_path):
            os.remove(file_path)
    db.query(ErrorImage).filter(ErrorImage.error_id == error_id).delete()
    db.delete(db_error)
    db.commit()
 
    return None

@router.post("/{error_id}/images/", response_model=ErrorImageResponse, dependencies=[Depends(get_current_active_admin)])
async def upload_error_image(error_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    if file.content_type not in ["image/png", "image/jpeg", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Invalid image type. Only PNG and JPG are allowed.")

    import re
    # Sanitize filename: replace spaces and non-alphanumeric chars with underscore
    safe_filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', file.filename)
    filename = f"{uuid.uuid4().hex}_{safe_filename}"
    file_path = os.path.join(ABS_UPLOAD_DIR, filename)
    import logging
    logging.info(f"Saving file to {file_path}")
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logging.info(f"File saved successfully: {file_path}")
    except Exception as e:
        logging.error(f"Error saving file {file_path}: {e}")
        raise

    image_url = f"/uploaded_images/{filename}"

    error = db.query(Error).filter(Error.id == error_id).first()
    if not error:
        raise HTTPException(status_code=404, detail="Error not found")

    error_image = ErrorImage(error_id=error_id, image_url=image_url)
    db.add(error_image)
    db.commit()
    db.refresh(error_image)

    return error_image

from fastapi import Query

@router.delete("/images/{image_id}", dependencies=[Depends(get_current_active_admin)], status_code=status.HTTP_204_NO_CONTENT)
def delete_error_image(
    image_id: int,
    db: Session = Depends(get_db),
):
    db_image = db.query(ErrorImage).filter(ErrorImage.id == image_id).first()
    if not db_image:
        raise HTTPException(status_code=404, detail="Image not found")
    # Удаляем файл с диска
    upload_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'uploaded_images'))
    file_path = os.path.join(upload_dir, db_image.image_url.lstrip('/'))
    if os.path.exists(file_path):
        os.remove(file_path)
    # Удаляем запись из базы
    db.delete(db_image)
    db.commit()
    return None
