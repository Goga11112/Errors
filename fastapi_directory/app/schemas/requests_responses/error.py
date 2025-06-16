from pydantic import BaseModel
from typing import List, Optional

# Ответ с изображением ошибки
class ErrorImageResponse(BaseModel):
    id: int
    image_url: str

    class Config:
        orm_mode = True

# Ответ с данными ошибки
class ErrorResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    images: List[ErrorImageResponse] = []

    class Config:
        orm_mode = True

# Запрос на создание ошибки
class ErrorCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    images: Optional[List[str]] = None  # URLs или base64 строки для изображений
