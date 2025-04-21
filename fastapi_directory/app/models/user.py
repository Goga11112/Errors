from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from fastapi_directory.app.db.database import Base


class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    username = Column(String, index=True)
    realname = Column(String, index=True)
    password_hash = Column(String, index=True)
    role_id = Column(Integer, ForeignKey('roles.id'))
    role = relationship("Role")
