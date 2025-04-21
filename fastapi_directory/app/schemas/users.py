from pydantic import BaseModel

class UsersBase(BaseModel):
    username: str
    realname: str

class UsersCreate(UsersBase):
    password: str

class UsersUpdate(UsersBase):
    password: str | None = None

class UsersResponse(UsersBase):
    id: int

    class Config:
        orm_mode = True
