from pydantic import BaseModel, validator
from typing import Optional
from app.schemas.role import RoleResponse

class UserBase(BaseModel):
    username: str
    realname: str

class UserResponse(BaseModel):
    id: int
    username: str
    realname: str
    role_id: int
    is_admin: bool  # Make sure these match your database model
    is_super_admin: bool  # Make sure these match your database model
    
    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    username: str
    password: str
    realname: str
    role_id: int  # This must match what the frontend sends
    is_admin: bool = False
    is_super_admin: bool = False

class UserUpdate(UserBase):
    password: Optional[str] = None
    role_id: Optional[int] = None
    is_admin: Optional[bool] = None
    is_super_admin: Optional[bool] = None

    @validator('password')
    def password_min_length(cls, v):
        if v is not None and len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v

