from pydantic import BaseModel
from datetime import datetime

class AdminLogBase(BaseModel):
    action: str

class AdminLogCreate(AdminLogBase):
    pass

class AdminLogResponse(AdminLogBase):
    id: int
    admin_id: int
    ip_address: str | None = None
    user_agent: str | None = None
    timestamp: datetime

    class Config:
        orm_mode = True
