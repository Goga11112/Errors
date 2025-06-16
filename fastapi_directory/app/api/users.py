from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.db.database import SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.core.security import get_password_hash, get_current_active_admin, get_current_super_admin
from app.api.admin_log import log_admin_action
from app.models.role import Role

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db), current_user=Depends(get_current_active_admin)):
    # Проверяем, что только главный администратор может назначать роли
    if user.role_id is not None:
        if current_user.role.name != "Главный администратор":
            raise HTTPException(status_code=403, detail="Недостаточно прав для назначения роли")
    else:
        # Если роль не указана, назначаем роль "Пользователь"
        role = db.query(Role).filter(Role.name == "Пользователь").first()
        user.role_id = role.id if role else None

    # Проверяем, что username уникален
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь с таким именем уже существует")

    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        realname=user.realname,
        password_hash=hashed_password,
        role_id=user.role_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    log_admin_action(db, current_user, f"Создан пользователь: {db_user.username}")
    return db_user

from fastapi import Request

@router.get("/", response_model=list[UserResponse])
def read_users(request: Request, db: Session = Depends(get_db)):
    print(f"Request query params: {request.query_params}")
    users = db.query(User).options(joinedload(User.role)).all()
    return users

@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user: UserCreate, db: Session = Depends(get_db), current_user=Depends(get_current_active_admin)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if user.role_id is not None and current_user.role.name != "Главный администратор":
        raise HTTPException(status_code=403, detail="Недостаточно прав для назначения роли")
    db_user.username = user.username
    db_user.realname = user.realname
    if user.password:
        db_user.password_hash = get_password_hash(user.password)
    if user.role_id is not None:
        db_user.role_id = user.role_id
    db.commit()
    db.refresh(db_user)
    log_admin_action(db, current_user, f"Обновлен пользователь: {db_user.username}")
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_active_admin)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    db.delete(db_user)
    db.commit()
    log_admin_action(db, current_user, f"Удален пользователь: {db_user.username}")
    return None
