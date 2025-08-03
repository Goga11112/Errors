import sys
import os
from time import sleep
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

# Добавляем путь для импортов
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

    if not all([host, dbname, user, password]):
        print("❌ Не заданы обязательные переменные окружения")
        return False

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

def is_db_initialized():
    """Проверяет, была ли уже выполнена инициализация"""
    db = SessionLocal()
    try:
        # Если есть хотя бы одна роль - значит БД уже инициализирована
        return db.query(Role).count() > 0
    except Exception as e:
        print(f"⚠️ Ошибка при проверке инициализации БД: {e}")
        return False
    finally:
        db.close()

def init_db():
    """Инициализирует БД начальными данными"""
    if is_db_initialized():
        print("ℹ️ База данных уже инициализирована, пропускаем заполнение")
        return

    db = SessionLocal()
    try:
        # Добавление ролей
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

        # Добавление пользователей
        users_data = [
            {"username": "Goga", "realname": "Егор Гаврилов", "password": "191202", 
             "role_name": "Администратор", "sadmin": True, "admin": True},
            {"username": "Ivan", "realname": "Иван Иванович", "password": "123", 
             "role_name": "Авторизованный пользователь", "sadmin": False, "admin": True},
            {"username": "Guest", "realname": "Гость", "password": "guestpass", 
             "role_name": "Гость", "sadmin": False, "admin": False}
        ]
        
        for user_data in users_data:
            existing_user = db.query(User).filter(User.username == user_data["username"]).first()
            if not existing_user:
                role = db.query(Role).filter(Role.name == user_data["role_name"]).first()
                if role:
                    user = User(
                        username=user_data["username"],
                        realname=user_data["realname"],
                        password_hash=get_password_hash(user_data["password"]),
                        role=role,
                        sadmin=user_data.get("sadmin", False),
                        admin=user_data.get("admin", False)
                    )
                    db.add(user)
        db.commit()

        # Добавление ошибок
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
        
        print("✅ Начальные данные успешно добавлены")

    except Exception as e:
        db.rollback()
        print(f"❌ Ошибка при инициализации БД: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    # Создаем сервер (если нужно)
    if not create_errors_server():
        sys.exit(1)
    
    # Создаем таблицы (если их нет)
    create_tables()
    
    # Инициализируем данные (только если БД пустая)
    init_db()