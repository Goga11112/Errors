from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.contact_info import ContactInfo
from app.schemas.contact_info import ContactInfoCreate, ContactInfoResponse, ContactInfoUpdate
from app.core.security import get_current_active_admin

router = APIRouter()

@router.post("/", response_model=ContactInfoResponse, status_code=status.HTTP_201_CREATED)
def create_contact_info(
    contact_info: ContactInfoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_admin)
):
    db_contact_info = ContactInfo(
        name=contact_info.name,
        phone_number=contact_info.phone_number,
        description=contact_info.description
    )
    db.add(db_contact_info)
    db.commit()
    db.refresh(db_contact_info)
    return db_contact_info

@router.get("/", response_model=List[ContactInfoResponse])
def read_contact_infos(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_admin)
):
    contact_infos = db.query(ContactInfo).all()
    return contact_infos

@router.put("/{contact_info_id}", response_model=ContactInfoResponse)
def update_contact_info(
    contact_info_id: int,
    contact_info: ContactInfoUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_admin)
):
    db_contact_info = db.query(ContactInfo).filter(ContactInfo.id == contact_info_id).first()
    if not db_contact_info:
        raise HTTPException(status_code=404, detail="Contact info not found")
    db_contact_info.name = contact_info.name
    db_contact_info.phone_number = contact_info.phone_number
    db_contact_info.description = contact_info.description
    db.commit()
    db.refresh(db_contact_info)
    return db_contact_info

@router.delete("/{contact_info_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact_info(
    contact_info_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_admin)
):
    db_contact_info = db.query(ContactInfo).filter(ContactInfo.id == contact_info_id).first()
    if not db_contact_info:
        raise HTTPException(status_code=404, detail="Contact info not found")
    db.delete(db_contact_info)
    db.commit()
    return None
