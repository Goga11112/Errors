from sqlalchemy import Column, Integer, String
from fastapi_directory.app.db.database import Base


class Admin_logs(Base):
    __tablename__ = 'admin_logs'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, primary_key=True)
    error_id = Column(Integer, primary_key=True)
    action_type = Column(String, index=True)
