import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/db_errors")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_goga_user():
    db = SessionLocal()
    try:
        # First check if Goga user already exists
        result = db.execute(text('SELECT id FROM "user" WHERE username = :username'), {"username": "Goga"})
        user_exists = result.fetchone()
        
        if user_exists:
            print("Пользователь Goga уже существует")
            return
        
        # Check if role exists
        result = db.execute(text('SELECT id FROM roles WHERE name = :name'), {"name": "Главный администратор"})
        role = result.fetchone()
        
        if not role:
            print("Роль 'Главный администратор' не найдена")
            return
        
        # Create Goga user
        hashed_password = get_password_hash("191202")
        
        db.execute(
            text('INSERT INTO "user" (username, realname, password_hash, role_id, admin, sadmin) VALUES (:username, :realname, :password_hash, :role_id, :admin, :sadmin)'),
            {
                "username": "Goga",
                "realname": "Goga",
                "password_hash": hashed_password,
                "role_id": role[0],
                "admin": True,
                "sadmin": True
            }
        )
        db.commit()
        print("Пользователь Goga успешно создан")
        
    except Exception as e:
        print(f"Ошибка при создании пользователя: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_goga_user()
