
from sqlalchemy import Column, Integer, String
from fastapi_directory.app.db.database import Base

class Error_images(Base):
    __tablename__ = 'error_images'
    id = Column(Integer, primary_key=True)
    filename = Column(String, index=True)
    type = Column(String, index=True)
    error_id = Column(Integer, primary_key=True)
