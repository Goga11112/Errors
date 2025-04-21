from sqlalchemy import Column, String
from fastapi_directory.app.db.database import Base

class Alembic_version(Base):
    __tablename__ = 'alembic_version'
    version_num = Column(String, index=True)
