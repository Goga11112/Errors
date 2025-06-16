from sqlalchemy import Column, Integer, String
from app.db.database import Base

class ContactInfo(Base):
    __tablename__ = "contact_info"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    description = Column(String, nullable=True)
