from pydantic import BaseModel, validator
from typing import Optional
from app.schemas.role import RoleResponse

class UserBase(BaseModel):
    username: str
    realname: str

class UserResponse(UserBase):
    id: int
    role: Optional[RoleResponse] = None

    class Config:
        orm_mode = True

class UserCreate(UserBase):
    password: str

    @validator('password')
    def password_min_length(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v

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
