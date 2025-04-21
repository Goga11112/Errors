
from sqlalchemy import Column, Integer, String
from fastapi_directory.app.db.database import Base

class Error_topic(Base):
    __tablename__ = 'error_topic'
    id = Column(Integer, primary_key=True)
    topic = Column(String, index=True)
    responsible = Column(String, index=True)
    phone = Column(String, index=True)
