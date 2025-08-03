from datetime import datetime  # Добавьте этот импорт в начале файла
from urllib.parse import unquote
from typing import List  # Для аннотации типов
from pathlib import Path as PathLib  # Для работы с путями
from datetime import datetime  # Для работы с датами
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
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
from app.api.admin_log import log_admin_action
from fastapi import Request
from app.models.user import User

load_dotenv()

import logging
import os
import pathlib
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

DEFAULT_UPLOAD_DIR = "/app/uploaded_images"
UPLOAD_DIR = os.getenv("UPLOAD_DIR", DEFAULT_UPLOAD_DIR)
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
    current_user: User = Depends(get_current_active_admin)
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
            try:
                logging.info(f"Attempting to save file to {file_path}")
                if not os.path.exists(ABS_UPLOAD_DIR):
                    logging.error(f"Upload directory does not exist: {ABS_UPLOAD_DIR}")
                    raise FileNotFoundError(f"Upload directory does not exist: {ABS_UPLOAD_DIR}")
                if not os.access(ABS_UPLOAD_DIR, os.W_OK):
                    logging.error(f"No write permission to directory: {ABS_UPLOAD_DIR}")
                    raise PermissionError(f"No write permission to directory: {ABS_UPLOAD_DIR}")
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                logging.info(f"File saved successfully: {file_path}")
            except Exception as e:
                logging.error(f"Error saving file {file_path}: {e}", exc_info=True)
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

@router.get("/{error_id}", response_model=ErrorResponse)
def read_error(error_id: int, db: Session = Depends(get_db)):
    db_error = db.query(Error).filter(Error.id == error_id).first()
    if not db_error:
        raise HTTPException(status_code=404, detail="Ошибка не найдена")
    return db_error

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
    log_admin_action(db, current_user=current_user, request=request, action=f"Обновлена ошибка: {db_error.name}")

    # Обновление изображений - сохраняем существующие изображения и добавляем новые
    if error.images is not None:
        # Получаем существующие изображения
        existing_images = db.query(ErrorImage).filter(ErrorImage.error_id == error_id).all()
        existing_image_urls = [img.image_url for img in existing_images]
        
        # Добавляем только новые изображения (те, что есть в новом списке, но нет в БД)
        for image_url in error.images:
            if image_url not in existing_image_urls:
                db_image = ErrorImage(error_id=error_id, image_url=image_url)
                db.add(db_image)
        
        db.commit()
   
    return db_error

@router.delete("/{error_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_error(
    error_id: int,
    db: Session = Depends(get_db),
    request: Request = None,
    current_user: User = Depends(get_current_active_admin)
):
    db_error = db.query(Error).filter(Error.id == error_id).first()
    if not db_error:
        raise HTTPException(status_code=404, detail="Ошибка не найдена")

    # Логирование удаления ошибки
    # log_admin_action(db, request=request, action=f"Удалена ошибка: {db_error.name}")

    # Удаляем связанные изображения и файлы
    images = db.query(ErrorImage).filter(ErrorImage.error_id == error_id).all()
    for img in images:
        # image_url is stored as "/uploaded_images/{filename}"
        # We need to extract just the filename part
        if img.image_url.startswith("/uploaded_images/"):
            filename = img.image_url[len("/uploaded_images/"):]
            file_path = os.path.join(ABS_UPLOAD_DIR, filename)
        else:
            # Fallback to the old method if the URL format is different
            filename = os.path.basename(img.image_url)
            file_path = os.path.join(ABS_UPLOAD_DIR, filename)
        
        logging.info(f"Attempting to delete image file: {file_path}")
        logging.info(f"Upload directory: {ABS_UPLOAD_DIR}")
        logging.info(f"Image URL: {img.image_url}")
        logging.info(f"Extracted filename: {filename}")
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logging.info(f"Deleted image file: {file_path}")
            else:
                logging.warning(f"Image file not found for deletion: {file_path}")
        except Exception as e:
            logging.error(f"Error deleting image file {file_path}: {e}", exc_info=True)
            raise
    db.query(ErrorImage).filter(ErrorImage.error_id == error_id).delete()
    db.delete(db_error)
    db.commit()
    #log_admin_action(db, request=request, action=f"Удалена ошибка: {db_error.name}") 
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
    logging.info(f"Upload directory: {ABS_UPLOAD_DIR}")
    logging.info(f"File path components: ABS_UPLOAD_DIR={ABS_UPLOAD_DIR}, filename={filename}")
    try:
        logging.info(f"Attempting to save file to {file_path}")
        if not os.path.exists(ABS_UPLOAD_DIR):
            logging.error(f"Upload directory does not exist: {ABS_UPLOAD_DIR}")
            raise FileNotFoundError(f"Upload directory does not exist: {ABS_UPLOAD_DIR}")
        if not os.access(ABS_UPLOAD_DIR, os.W_OK):
            logging.error(f"No write permission to directory: {ABS_UPLOAD_DIR}")
            raise PermissionError(f"No write permission to directory: {ABS_UPLOAD_DIR}")
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
    # image_url is stored as "/uploaded_images/{filename}"
    # We need to extract just the filename part
    if db_image.image_url.startswith("/uploaded_images/"):
        filename = db_image.image_url[len("/uploaded_images/"):]
        file_path = os.path.join(ABS_UPLOAD_DIR, filename)
    else:
        # Fallback to the old method if the URL format is different
        file_path = os.path.join(ABS_UPLOAD_DIR, db_image.image_url.lstrip('/'))
    
    logging.info(f"Attempting to delete image file: {file_path}")
    logging.info(f"Upload directory: {ABS_UPLOAD_DIR}")
    logging.info(f"Image URL: {db_image.image_url}")
    logging.info(f"Extracted filename: {filename if 'filename' in locals() else 'N/A'}")
    logging.info(f"Full file path: {file_path}")
    if os.path.exists(file_path):
        os.remove(file_path)
        logging.info(f"Deleted image file: {file_path}")
    else:
        logging.warning(f"Image file not found for deletion: {file_path}")
    # Удаляем запись из базы
    db.delete(db_image)
    db.commit()
    #log_admin_action(db, request=db_image, action=f"Удалена ошибка: {db_image.image_url}") 
    return None

@router.get("/images/orphaned/", response_model=List[dict])
def get_orphaned_images(db: Session = Depends(get_db)):
    """Получает список бесхозных изображений"""
    try:
        # Получаем все URL изображений из базы данных используя ORM
        db_images = db.query(ErrorImage.image_url).all()
        db_urls = {img.image_url for img in db_images}
        logging.info(f"Found {len(db_urls)} images in database")
        
        # Проверяем существование директории загрузки
        upload_dir = PathLib(ABS_UPLOAD_DIR)
        logging.info(f"Upload directory: {upload_dir}")
        logging.info(f"Upload directory exists: {upload_dir.exists()}")
        
        if not upload_dir.exists():
            raise HTTPException(
                status_code=500,
                detail="Upload directory does not exist"
            )
        
        orphaned_files = []
        
        # Сканируем все файлы в директории загрузки
        for file_path in upload_dir.rglob('*'):
            if file_path.is_file():
                try:
                    # Создаем URL как в БД
                    rel_path = str(file_path.relative_to(upload_dir)).replace("\\", "/")
                    db_url = f"/uploaded_images/{rel_path}"
                    logging.info(f"Processing file: {file_path}, URL: {db_url}")
                    
                    # Проверяем, есть ли этот файл в БД
                    if db_url not in db_urls:
                        stat = file_path.stat()
                        orphaned_files.append({
                            "file_path": db_url,
                            "absolute_path": str(file_path),
                            "size": stat.st_size,
                            "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                            "filename": file_path.name,
                            "id": str(file_path)  # Добавляем ID для фронтенда
                        })
                except Exception as e:
                    logging.error(f"Error processing file {file_path}: {e}")
                    continue
        
        logging.info(f"Found {len(orphaned_files)} orphaned files")
        return orphaned_files
    
    except Exception as e:
        logging.error(f"Error in get_orphaned_images: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error scanning files: {str(e)}"
        )
    
    
@router.delete("/images/delete-orphaned/{file_path:path}")
async def delete_orphaned_file(
    file_path: str,
    db: Session = Depends(get_db)
):
    """Удаляет бесхозный файл по его пути"""
    try:
        # Декодируем путь
        decoded_path = unquote(file_path)
        
        # Путь к файлу в upload директории
        # file_path приходит как "filename.png" (относительный путь от /uploaded_images/)
        file_full_path = os.path.join(ABS_UPLOAD_DIR, decoded_path)
        
        # Проверяем, что файл находится внутри upload директории (безопасность)
        file_full_path = os.path.abspath(file_full_path)
        abs_upload_dir = os.path.abspath(ABS_UPLOAD_DIR)
        
        if not file_full_path.startswith(abs_upload_dir):
            raise HTTPException(
                status_code=403,
                detail="Cannot delete files outside upload directory"
            )
        
        if not os.path.exists(file_full_path):
            raise HTTPException(
                status_code=404,
                detail="File not found"
            )
        
        os.remove(file_full_path)
        
        return {"status": "success", "message": "File deleted"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting file: {str(e)}"
        )
    
@router.get("/images/failed/", response_model=list)
def get_orphaned_files(db: Session = Depends(get_db),
                     current_user: User = Depends(get_current_active_admin)):
    """
    Get all files in upload directory that don't exist in error_images table
    Returns: List of {file_path: str, size: int, modified: str}
    """
    # 1. Get all image URLs from database
    db_images = db.query(ErrorImage.image_url).all()
    db_urls = {img.image_url for img in db_images}  # Используем set для быстрого поиска
    
    # 2. Scan upload directory
    upload_dir = ABS_UPLOAD_DIR
    orphaned_files = []
    
    for root, _, files in os.walk(upload_dir):
        for filename in files:
            # Создаем относительный путь как в БД
            full_path = os.path.join(root, filename)
            try:
                # Get the relative path from upload_dir to the file
                rel_path = os.path.relpath(full_path, upload_dir).replace("\\", "/")
                db_url = f"/uploaded_images/{rel_path}"
                
                # Проверяем наличие в БД
                if db_url not in db_urls:
                    stat = os.stat(full_path)
                    
                    orphaned_files.append({
                        "file_path": db_url,
                        "absolute_path": full_path,
                        "size": stat.st_size,
                        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                        "status": "not_referenced_in_db"
                    })
            except Exception as e:
                logging.error(f"Error processing file {full_path}: {e}")
                continue
    
    return orphaned_files
