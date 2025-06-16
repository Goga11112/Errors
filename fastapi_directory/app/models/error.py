from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class Error(Base):
    __tablename__ = 'error'
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text, nullable=True)
    solution_description = Column(Text, nullable=True)
    images = relationship("ErrorImage", back_populates="error")



class ErrorImage(Base):
    __tablename__ = 'error_images'
    id = Column(Integer, primary_key=True)
    error_id = Column(Integer, ForeignKey('error.id'))
    image_url = Column(String, nullable=False)
    error = relationship("Error", back_populates="images")
