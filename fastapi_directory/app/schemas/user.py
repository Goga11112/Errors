from pydantic import BaseModel

class UserBase(BaseModel):
    username: str
    realname: str

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: str | None = None

class UserResponse(UserBase):
    id: int

    class Config:
        orm_mode = True
