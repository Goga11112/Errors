from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi_directory.app.db.database import SessionLocal
from fastapi_directory.app.schemas.error import ErrorCreate, ErrorResponse
from fastapi_directory.app.models.error import Error
from fastapi_directory.app.core.security import get_current_active_admin, get_current_active_user
from fastapi_directory.app.api.admin_log import log_admin_action

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/errors/", response_model=ErrorResponse, status_code=status.HTTP_201_CREATED)
def create_error(error: ErrorCreate, db: Session = Depends(get_db), current_user=Depends(get_current_active_admin)):
    db_error = db.query(Error).filter(Error.name == error.name).first()
    if db_error:
        raise HTTPException(status_code=400, detail="Ошибка с таким именем уже существует")
    db_error = Error(name=error.name)
    db.add(db_error)
    db.commit()
    db.refresh(db_error)
    log_admin_action(db, current_user, f"Создана ошибка: {db_error.name}")
    return db_error

@router.get("/errors/", response_model=list[ErrorResponse])
def read_errors(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    errors = db.query(Error).offset(skip).limit(limit).all()
    return errors

@router.put("/errors/{error_id}", response_model=ErrorResponse)
def update_error(error_id: int, error: ErrorCreate, db: Session = Depends(get_db), current_user=Depends(get_current_active_admin)):
    db_error = db.query(Error).filter(Error.id == error_id).first()
    if not db_error:
        raise HTTPException(status_code=404, detail="Ошибка не найдена")
    db_error.name = error.name
    db.commit()
    db.refresh(db_error)
    log_admin_action(db, current_user, f"Обновлена ошибка: {db_error.name}")
    return db_error

@router.delete("/errors/{error_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_error(error_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_active_admin)):
    db_error = db.query(Error).filter(Error.id == error_id).first()
    if not db_error:
        raise HTTPException(status_code=404, detail="Ошибка не найдена")
    db.delete(db_error)
    db.commit()
    log_admin_action(db, current_user, f"Удалена ошибка: {db_error.name}")
    return None
