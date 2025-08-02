import sys
import os

# Add the current directory to sys.path
sys.path.insert(0, '/app')

from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.user import User
from models.role import Role
from core.security import get_password_hash

def create_goga_user():
    db: Session = SessionLocal()
    try:
        # Найти роль "Главный администратор"
        super_admin_role = db.query(Role).filter(Role.name == "Главный администратор").first()
        if not super_admin_role:
            print("Роль 'Главный администратор' не найдена")
            return

        # Проверить, существует ли пользователь с именем Goga
        existing_user = db.query(User).filter(User.username == "Goga").first()
        if existing_user:
            print("Пользователь Goga уже существует")
            return

        # Создать пользователя Goga
        hashed_password = get_password_hash("191202")
        goga_user = User(
            username="Goga",
            realname="Goga",
            password_hash=hashed_password,
            role_id=super_admin_role.id
        )
        db.add(goga_user)
        db.commit()
        db.refresh(goga_user)
        print("Пользователь Goga успешно создан")
    finally:
        db.close()

if __name__ == "__main__":
    create_goga_user()
