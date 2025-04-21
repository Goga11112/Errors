from sqlalchemy import Column, Integer, String
from fastapi_directory.app.db.database import Base


class Errors(Base):
    __tablename__ = 'errors'
    id = Column(Integer, primary_key=True)
    name = Column(String, index=True)
