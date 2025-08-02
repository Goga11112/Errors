from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.security import authenticate_user, create_access_token, get_current_user, get_password_hash, get_current_active_user
from app.db.database import get_db
from app.schemas.token import Token, UserLogin
from app.schemas.user import UserResponse

router = APIRouter()

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден или неверный пароль. Пожалуйста, проверьте правильность введенных данных.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=UserResponse)
def read_users_me(current_user=Depends(get_current_user)):
    # Map sadmin and admin to is_super_admin and is_admin for response
    current_user.is_super_admin = getattr(current_user, 'sadmin', False)
    current_user.is_admin = getattr(current_user, 'admin', False)
    return current_user

@router.get("/users/me/basic", response_model=UserResponse)
def read_users_me_basic(current_user = Depends(get_current_active_user)):
    # Map sadmin and admin to is_super_admin and is_admin for response
    current_user.is_super_admin = getattr(current_user, 'sadmin', False)
    current_user.is_admin = getattr(current_user, 'admin', False)
    return current_user
