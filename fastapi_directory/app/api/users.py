from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.db.database import SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate
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
def create_user(user: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    # Проверяем, что только главный администратор может назначать роли
    if user.role_id is not None:
        if current_user.role.name != "Администратор":
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
    # Map sadmin and admin to is_super_admin and is_admin for response
    result = []
    for user in users:
        user.is_super_admin = user.sadmin
        user.is_admin = user.admin
        result.append(user)
    return result

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_active_admin)):
    # Map sadmin and admin to is_super_admin and is_admin for response
    current_user.is_super_admin = current_user.sadmin
    current_user.is_admin = current_user.admin
    return current_user

from fastapi import Body

@router.put("/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    role_id: int = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if current_user.role.name != "Администратор":
        raise HTTPException(status_code=403, detail="Недостаточно прав для назначения роли")
    db_user.role_id = role_id
    db.commit()
    db.refresh(db_user)
    log_admin_action(db, current_user, f"Обновлена роль пользователя: {db_user.username}")
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    db.delete(db_user)
    db.commit()
    log_admin_action(db, current_user, f"Удален пользователь: {db_user.username}")
    return None

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    # Проверяем, что только главный администратор может назначать роли
    if user_update.role_id is not None:
        if current_user.role.name != "Администратор":
            raise HTTPException(status_code=403, detail="Недостаточно прав для назначения роли")

    db_user.username = user_update.username
    db_user.realname = user_update.realname
    if user_update.role_id is not None:
        db_user.role_id = user_update.role_id
    if user_update.is_admin is not None:
        db_user.is_admin = user_update.is_admin
    if user_update.is_super_admin is not None:
        db_user.is_super_admin = user_update.is_super_admin

    db.commit()
    db.refresh(db_user)
    log_admin_action(db, current_user, f"Обновлен пользователь: {db_user.username}")
    return db_user
