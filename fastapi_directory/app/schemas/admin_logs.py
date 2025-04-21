from pydantic import BaseModel

class AdminLogsBase(BaseModel):
    user_id: int
    error_id: int
    action_type: str

class AdminLogsCreate(AdminLogsBase):
    pass

class AdminLogsUpdate(AdminLogsBase):
    pass

class AdminLogsResponse(AdminLogsBase):
    id: int

    class Config:
        orm_mode = True
