from sqlalchemy import Column, Integer, String
from fastapi_directory.app.db.database import Base


class Error(Base):
    __tablename__ = 'error'
    id = Column(Integer, primary_key=True)
    name = Column(String, index=True)
