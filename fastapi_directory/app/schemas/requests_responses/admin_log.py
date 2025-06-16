from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Базовая модель админ лога
class AdminLogBase(BaseModel):
    action: str

# Запрос на создание админ лога
class AdminLogCreateRequest(AdminLogBase):
    pass

# Ответ с данными админ лога
class AdminLogResponse(AdminLogBase):
    id: int
    admin_id: int
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime

    class Config:
        orm_mode = True
