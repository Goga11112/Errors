from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Настройки подключения к PostgreSQL
SQLALCHEMY_DATABASE_URL = "postgresql://Goga11112:191202@localhost/db_errors"

# Создание движка SQLAlchemy
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Создание сессии для работы с базой данных
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для моделей
Base = declarative_base()
