from pydantic import BaseModel
from typing import List, Optional

class ErrorImageResponse(BaseModel):
    id: int
    image_url: str

    class Config:
        orm_mode = True

class ErrorResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    images: List[ErrorImageResponse] = []

    class Config:
        orm_mode = True

class ErrorCreate(BaseModel):
    name: str
    description: Optional[str] = None
    images: Optional[List[str]] = None  # URLs or base64 strings for images
