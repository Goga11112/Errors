from pydantic import BaseModel

class ContactInfoBase(BaseModel):
    name: str
    phone_number: str
    description: str | None = None

class ContactInfoCreate(ContactInfoBase):
    pass

class ContactInfoUpdate(ContactInfoBase):
    pass

class ContactInfoResponse(ContactInfoBase):
    id: int

    class Config:
        orm_mode = True
