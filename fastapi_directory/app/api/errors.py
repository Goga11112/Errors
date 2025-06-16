from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
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
from app.api.admin_log import log_admin_action

load_dotenv()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploaded_images")
pathlib.Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

router = APIRouter()

router.mount("/uploaded_images", StaticFiles(directory=UPLOAD_DIR), name="uploaded_images")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ErrorResponse, status_code=status.HTTP_201_CREATED)
def create_error(error: ErrorCreate, db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    db_error = db.query(Error).filter(Error.name == error.name).first()
    if db_error:
        raise HTTPException(status_code=400, detail="Ошибка с таким именем уже существует")
    db_error = Error(name=error.name, description=error.description)
    db.add(db_error)
    db.commit()
    db.refresh(db_error)
    # Добавление изображений, если есть
    if error.images:
        for image_url in error.images:
            db_image = ErrorImage(error_id=db_error.id, image_url=image_url)
            db.add(db_image)
        db.commit()
    log_admin_action(db, current_user, f"Создана ошибка: {db_error.name}")
    return db_error

@router.get("/", response_model=list[ErrorResponse])
def read_errors(db: Session = Depends(get_db)):
    errors = db.query(Error).all()
    return errors

@router.put("/{error_id}", response_model=ErrorResponse)
def update_error(error_id: int, error: ErrorCreate, db: Session = Depends(get_db), current_user=Depends(get_current_active_admin)):
    db_error = db.query(Error).filter(Error.id == error_id).first()
    if not db_error:
        raise HTTPException(status_code=404, detail="Ошибка не найдена")
    db_error.name = error.name
    db_error.description = error.description
    db.commit()
    db.refresh(db_error)
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
    log_admin_action(db, current_user, f"Обновлена ошибка: {db_error.name}")
    return db_error

@router.delete("/{error_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_error(error_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_active_admin)):
    db_error = db.query(Error).filter(Error.id == error_id).first()
    if not db_error:
        raise HTTPException(status_code=404, detail="Ошибка не найдена")
    # Удаляем связанные изображения и файлы
    images = db.query(ErrorImage).filter(ErrorImage.error_id == error_id).all()
    for img in images:
        file_path = img.image_url.lstrip('/')
        if os.path.exists(file_path):
            os.remove(file_path)
    db.query(ErrorImage).filter(ErrorImage.error_id == error_id).delete()
    db.delete(db_error)
    db.commit()
    log_admin_action(db, current_user, f"Удалена ошибка: {db_error.name}")
    return None

@router.post("/{error_id}/images/", response_model=ErrorImageResponse, dependencies=[Depends(get_current_active_admin)])
async def upload_error_image(error_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    if file.content_type not in ["image/png", "image/jpeg", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Invalid image type. Only PNG and JPG are allowed.")

    filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    image_url = f"/{UPLOAD_DIR}/{filename}"

    error = db.query(Error).filter(Error.id == error_id).first()
    if not error:
        raise HTTPException(status_code=404, detail="Error not found")

    error_image = ErrorImage(error_id=error_id, image_url=image_url)
    db.add(error_image)
    db.commit()
    db.refresh(error_image)

    return error_image
