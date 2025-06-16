from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.role import Role
from app.models.user import User
from app.schemas.user import UserResponse
from app.core.security import get_current_super_admin, get_password_hash

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Предопределённые роли
PREDEFINED_ROLES = [
    {"name": "Главный администратор", "description": "Может создавать новых обычных администраторов"},
    {"name": "Обычный Администратор", "description": "Может создавать новые ошибки"},
    {"name": "Пользователь", "description": "Может не авторизироваться и видеть всю информацию кроме логирования"}
]

@router.post("/users/init_admin", status_code=201)
def init_admin(db: Session = Depends(get_db)):
    # Проверяем, есть ли уже пользователь admin
    admin_user = db.query(User).filter(User.username == "admin").first()
    if admin_user:
        return {"detail": "Пользователь admin уже существует"}

    # Получаем роль Главного администратора
    super_admin_role = db.query(Role).filter(Role.name == "Главный администратор").first()
    if not super_admin_role:
        raise HTTPException(status_code=400, detail="Роль Главный администратор не найдена")

    # Создаем пользователя admin с паролем admin
    hashed_password = get_password_hash("admin")
    admin_user = User(
        username="admin",
        realname="Главный Администратор",
        password_hash=hashed_password,
        role_id=super_admin_role.id
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    return {"detail": "Пользователь admin создан"}


@router.post("/roles/init", status_code=status.HTTP_201_CREATED)
def init_roles(db: Session = Depends(get_db), current_user=Depends(get_current_super_admin)):
    for role_data in PREDEFINED_ROLES:
        db_role = db.query(Role).filter(Role.name == role_data["name"]).first()
        if not db_role:
            role = Role(name=role_data["name"], description=role_data["description"])
            db.add(role)
    db.commit()
    return {"detail": "Роли инициализированы"}

@router.get("/roles/", response_model=list[str])
def read_roles(db: Session = Depends(get_db), current_user=Depends(get_current_super_admin)):
    roles = db.query(Role).all()
    return [role.name for role in roles]
