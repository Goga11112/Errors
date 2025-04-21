from sqlalchemy import Column, Integer, String
from fastapi_directory.app.db.database import Base


class Error_image(Base):
    __tablename__ = 'error_image'
    id = Column(Integer, primary_key=True)
    filename = Column(String, index=True)
    error_id = Column(Integer, primary_key=True)
    type = Column(String, index=True)
