from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi_directory.app.db.database import SessionLocal
from fastapi_directory.app.schemas.admin_log import AdminLogCreate, AdminLogResponse
from fastapi_directory.app.models.admin_log import Admin_log
from fastapi_directory.app.core.security import get_current_active_admin

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/admin_logs/", response_model=AdminLogResponse, status_code=status.HTTP_201_CREATED)
def create_admin_log(log: AdminLogCreate, db: Session = Depends(get_db), current_user=Depends(get_current_active_admin)):
    db_log = Admin_log(
        user_id=current_user.id,
        error_id=log.error_id,
        action_type=log.action_type
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@router.get("/admin_logs/", response_model=list[AdminLogResponse])
def read_admin_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user=Depends(get_current_active_admin)):
    logs = db.query(Admin_log).offset(skip).limit(limit).all()
    return logs
