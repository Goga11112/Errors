from pydantic import BaseModel
from typing import Optional
from app.schemas.role import RoleResponse

class UserBase(BaseModel):
    username: str
    realname: str

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: str | None = None

class UserResponse(UserBase):
    id: int
    role: Optional[RoleResponse] = None

    class Config:
        orm_mode = True
