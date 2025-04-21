from pydantic import BaseModel

class AdminLogBase(BaseModel):
    user_id: int
    error_id: int
    action_type: str

class AdminLogCreate(AdminLogBase):
    pass

class AdminLogUpdate(AdminLogBase):
    pass

class AdminLogResponse(AdminLogBase):
    id: int

    class Config:
        orm_mode = True
