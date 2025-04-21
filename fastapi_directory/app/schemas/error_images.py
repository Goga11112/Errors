from pydantic import BaseModel

class ErrorImagesBase(BaseModel):
    filename: str
    type: str
    error_id: int

class ErrorImagesCreate(ErrorImagesBase):
    pass

class ErrorImagesUpdate(ErrorImagesBase):
    pass

class ErrorImagesResponse(ErrorImagesBase):
    id: int

    class Config:
        orm_mode = True
