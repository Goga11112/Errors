from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.schemas.user import UserCreate, UserResponse
from app.models.user import User
from app.core.security import get_password_hash, get_current_super_admin

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/admins/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_admin(user: UserCreate, db: Session = Depends(get_db), current_user=Depends(get_current_super_admin)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Пользователь с таким именем уже существует")
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        realname=user.realname,
        password_hash=hashed_password,
        role_id=1  # Главный администратор
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
