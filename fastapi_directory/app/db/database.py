import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
from fastapi import Request

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Import all models here to ensure they are registered with Base for Alembic
from app import models

def get_db():
    """Унифицированная функция для получения сессии БД"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
