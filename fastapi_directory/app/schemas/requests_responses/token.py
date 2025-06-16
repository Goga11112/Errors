from pydantic import BaseModel

# Запрос на получение токена (например, при логине)
class TokenRequest(BaseModel):
    username: str
    password: str

# Ответ с токеном доступа
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
