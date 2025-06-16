from pydantic import BaseModel
from typing import Optional

# Базовая модель пользователя
class UserBase(BaseModel):
    username: str
    realname: str

# Запрос на создание пользователя
class UserCreateRequest(UserBase):
    password: str

# Запрос на обновление пользователя
class UserUpdateRequest(UserBase):
    password: Optional[str] = None

# Ответ с данными пользователя
class UserResponse(UserBase):
    id: int
    role: Optional[str] = None  # Можно заменить на соответствующую модель роли

    class Config:
        orm_mode = True
