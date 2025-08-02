import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.user import User

# Настройки безопасности
SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

import logging

class JWTBearer(HTTPBearer):
    def __init__(self):
        super().__init__(
            auto_error=True,
            scheme_name="JWT",
            description="Bearer token authentication"
        )

    async def __call__(self, request: Request) -> str:
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)
        if not credentials.scheme == "Bearer":
            #logging.error(f"Invalid authentication scheme: {credentials.scheme}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid authentication scheme"
            )
        #logging.info(f"JWT token received: {credentials.credentials}")
        return credentials.credentials

jwt_bearer = JWTBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверяет соответствие пароля и хеша"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Генерирует хеш пароля"""
    return pwd_context.hash(password)


def get_user(db: Session, username: str) -> Optional[User]:
    """Получает пользователя из базы данных"""
    return db.query(User).filter(User.username == username).first()

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """Аутентифицирует пользователя"""
    user = get_user(db, username)
    if not user or not verify_password(password, user.password_hash):
        return None
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Создает JWT токен"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

from app.db.database import get_db

def get_current_user(
    request: Request,  # Добавляем request в параметры
    token: str = Depends(jwt_bearer),
    db: Session = Depends(get_db)
) -> User:
    """Получает текущего пользователя из JWT токена"""
   # import logging
    auth_header = request.headers.get("Authorization")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        #logging.info(f"Decoding token: {token}")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if (username := payload.get("sub")) is None:
            #logging.error("JWT payload does not contain 'sub'")
            raise credentials_exception
    except JWTError as exc:
        #logging.error(f"JWT decode error: {exc}")
        raise credentials_exception from exc
    
    user = get_user(db, username)
    if user is None:
        #logging.error(f"User not found in DB: {username}")
        raise credentials_exception
        
    #logging.info(f"Authenticated user: {username} with role id: {user.role.id if user.role else 'None'}")
    return user

def get_current_active_user(
        request: Request,
        current_user: User = Depends(get_current_user)) -> User:
    """Возвращает текущего активного пользователя"""
    
    return current_user

def get_current_active_admin(
    request: Request,
    current_user: User = Depends(get_current_user)
) -> User:
    """Проверяет права администратора"""
#     import logging
#     logging.info(f"Checking admin rights for user: {current_user.username}, admin flag: {getattr(current_user, 'admin', None)}")
    if not getattr(current_user, "admin", False):
#         logging.error(f"User admin: {getattr(current_user, 'admin', None)} - no admin rights")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав"
        )
#     logging.info(f"User authorized as admin with admin: {getattr(current_user, 'admin', None)}")
    return current_user

def get_current_super_admin(
        request: Request,
        current_user: User = Depends(get_current_user)) -> User:
    """Проверяет права главного администратора"""
#     import logging
    if not getattr(current_user, "sadmin", False):
#         logging.error(f"User sadmin: {getattr(current_user, 'sadmin', None)} - no super admin rights")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав"
        )
#     logging.info(f"User authorized as super admin with sadmin: {getattr(current_user, 'sadmin', None)}")
    return current_user
