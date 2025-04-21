from pydantic import BaseModel

class ErrorImageBase(BaseModel):
    filename: str
    error_id: int
    type: str

class ErrorImageCreate(ErrorImageBase):
    pass

class ErrorImageUpdate(ErrorImageBase):
    pass

class ErrorImageResponse(ErrorImageBase):
    id: int

    class Config:
        orm_mode = True
