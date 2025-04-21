from pydantic import BaseModel

class ErrorsBase(BaseModel):
    name: str

class ErrorsCreate(ErrorsBase):
    pass

class ErrorsUpdate(ErrorsBase):
    pass

class ErrorsResponse(ErrorsBase):
    id: int

    class Config:
        orm_mode = True
