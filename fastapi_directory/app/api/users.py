from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi_directory.app.db.database import SessionLocal
from fastapi_directory.app.models.user import User
from fastapi_directory.app.schemas.user import UserCreate, UserResponse
from fastapi_directory.app.core.security import get_current_active_user, get_password_hash, get_current_active_admin, get_current_super_admin

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
        from fastapi_directory.app.models.role import Role
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
    return db_user



@router.get("/users/me", response_model=UserResponse)
def read_users_me(current_user=Depends(get_current_active_user)):
    return current_user
