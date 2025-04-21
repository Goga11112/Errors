from pydantic import BaseModel

class ErrorBase(BaseModel):
    name: str

class ErrorCreate(ErrorBase):
    pass

class ErrorUpdate(ErrorBase):
    pass

class ErrorResponse(ErrorBase):
    id: int

    class Config:
        orm_mode = True
