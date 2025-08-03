import sys
import os
from time import sleep
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

# Добавляем путь для импортов (ваш текущий код)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

from app.db.database import SessionLocal, engine
from app.models.user import User
from app.models.role import Role
from app.models.error import Error
from app.core.security import get_password_hash

def create_errors_server():
    """Создает сервер Errors_server, если его нет."""
    max_retries = 5
    retry_delay = 3

    host = os.getenv("POSTGRES_HOST")
    dbname = os.getenv("POSTGRES_DB")
    user = os.getenv("POSTGRES_USER")
    password = os.getenv("POSTGRES_PASSWORD")

    for attempt in range(max_retries):
        try:
            with engine.connect() as conn:
                # Проверяем наличие расширения
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgres_fdw;"))
                conn.commit()
                
                # Проверяем существование сервера
                result = conn.execute(
                    text("SELECT 1 FROM pg_foreign_server WHERE srvname = 'errors_server';")
                ).scalar()
                
                if not result:
                    conn.execute(text("""
                        CREATE SERVER errors_server 
                        FOREIGN DATA WRAPPER postgres_fdw 
                        OPTIONS (host :host, dbname :dbname, port '5432');
                    """), {'host': host, 'dbname': dbname})
                    
                    conn.execute(text("""
                        CREATE USER MAPPING IF NOT EXISTS FOR CURRENT_USER
                        SERVER errors_server 
                        OPTIONS (user :user, password :password);
                    """), {'user': user, 'password': password})
                    
                    conn.commit()
                    print("✅ Сервер 'errors_server' создан")
                else:
                    print("✅ Сервер 'errors_server' уже существует")
                return True

        except OperationalError as e:
            print(f"⚠️ Попытка {attempt + 1}/{max_retries}: Ошибка подключения к БД — {e}")
            if attempt < max_retries - 1:
                sleep(retry_delay)
    
    print("❌ Не удалось создать сервер 'errors_server'")
    return False

def create_tables():
    """Создаёт все таблицы через SQLAlchemy"""
    from app.db.database import Base
    Base.metadata.create_all(bind=engine)
    print("✅ Таблицы созданы")

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
    if create_errors_server():  # Сначала создаем сервер
        create_tables()
        init_db()              # Затем заполняем БД
    else:
        sys.exit(1)  # Завершаем с ошибкой, если сервер не создан