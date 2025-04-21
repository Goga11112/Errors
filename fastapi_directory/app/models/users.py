from sqlalchemy import Column, Integer, String
from fastapi_directory.app.db.database import Base


class Users(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String, index=True)
    realname = Column(String, index=True)
    password_hash = Column(String, index=True)
