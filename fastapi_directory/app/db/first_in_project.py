import sys
import os

# Add the parent directory of fastapi_directory to sys.path to allow imports of 'app'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

from app.db.database import SessionLocal
from app.models.user import User
from app.models.role import Role
from app.models.error import Error
from app.core.security import get_password_hash

def init_db():
    db = SessionLocal()
    try:
        # Add roles
        roles_data = [
            {"name": "Администратор", "description": "Полный доступ и управление приложением"},
            {"name": "Авторизованный пользователь", "description": "Доступ к созданию и просмотру ошибок"},
            {"name": "Гость", "description": "Ограниченный доступ, только просмотр публичной информации"}
        ]
        for role_data in roles_data:
            existing_role = db.query(Role).filter(Role.name == role_data["name"]).first()
            if not existing_role:
                role = Role(name=role_data["name"], description=role_data["description"])
                db.add(role)
        db.commit()

        # Add users
        users_data = [
            {"username": "Goga", "realname": "Главный администратор", "password": "191202", "role_name": "Администратор"},
            {"username": "Ivan", "realname": "Авторизованный пользователь Иван", "password": "password1", "role_name": "Авторизованный пользователь"},
            {"username": "Guest", "realname": "Гость", "password": "guestpass", "role_name": "Гость"}
        ]
        for user_data in users_data:
            existing_user = db.query(User).filter(User.username == user_data["username"]).first()
            if not existing_user:
                role = db.query(Role).filter(Role.name == user_data["role_name"]).first()
                user = User(
                    username=user_data["username"],
                    realname=user_data["realname"],
                    password_hash=get_password_hash(user_data["password"]),
                    role=role
                )
                db.add(user)
        db.commit()

        # Add example errors
        errors_data = [
            {"name": "Ошибка 404", "description": "Страница не найдена"},
            {"name": "Ошибка 500", "description": "Внутренняя ошибка сервера"},
            {"name": "Ошибка подключения к базе данных", "description": "Не удалось установить соединение с базой данных"}
        ]
        for error_data in errors_data:
            existing_error = db.query(Error).filter(Error.name == error_data["name"]).first()
            if not existing_error:
                error = Error(
                    name=error_data["name"],
                    description=error_data["description"]
                )
                db.add(error)
        db.commit()

    finally:
        db.close()

if __name__ == "__main__":
    init_db()
