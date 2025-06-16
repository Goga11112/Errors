from pydantic import BaseModel
from typing import Optional

# Запрос на вход в аккаунт
class UserLoginRequest(BaseModel):
    username: str
    password: str
    remember_me: Optional[bool] = False

# Ответ на вход в аккаунт (например, токен)
class UserLoginResponse(BaseModel):
    access_token: str
    token_type: str
