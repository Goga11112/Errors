from sqlalchemy import Column, Integer, String
from fastapi_directory.app.db.database import Base


class Admin_log(Base):
    __tablename__ = 'admin_log'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, primary_key=True)
    error_id = Column(Integer, primary_key=True)
    action_type = Column(String, index=True)
