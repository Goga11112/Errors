from pydantic import BaseModel

class ErrorTopicBase(BaseModel):
    topic: str
    responsible: str
    phone: str

class ErrorTopicCreate(ErrorTopicBase):
    pass

class ErrorTopicUpdate(ErrorTopicBase):
    pass

class ErrorTopicResponse(ErrorTopicBase):
    id: int

    class Config:
        orm_mode = True
