from sqlalchemy import Boolean, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.models.role import Role  # Import Role to resolve relationship
from sqlalchemy.orm import relationship
from app.models.admin_log import AdminLog  # Import AdminLog to resolve relationship

class User(Base):
    __tablename__ = 'user'
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True)
    username = Column(String, index=True)
    realname = Column(String, index=True)
    password_hash = Column(String, index=True)
    role_id = Column(Integer, ForeignKey('roles.id'))
    role = relationship("Role", overlaps="role")
    sadmin = Column(Boolean, default=False, nullable=False)
    admin = Column(Boolean, default=False, nullable=False)
    admin_logs = relationship("AdminLog", back_populates="admin")
