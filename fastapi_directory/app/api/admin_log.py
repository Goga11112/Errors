from fastapi import Depends, HTTPException, Request, status, APIRouter, Query
from sqlalchemy.orm import Session
from app.models.admin_log import AdminLog
from app.core.security import get_current_active_admin
from app.db.database import get_db
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime
from app.schemas.admin_logs import AdminLogCreate, AdminLogResponse

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def log_admin_action(
    db: Session,
    current_user = Depends(get_current_active_admin),
    action: str = "",
    request: Request = None
):
    """
    Логирование действий администратора.
    :param db: сессия базы данных
    :param current_user: текущий пользователь (администратор)
    :param action: описание действия
    :param request: объект запроса (опционально, для логирования IP и User-Agent)
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized"
        )
    ip_address = None
    user_agent = None
    if request:
        ip_address = request.client.host
        user_agent = request.headers.get("user-agent")

    admin_log = AdminLog(
        admin_id=current_user.id,
        action=action,
        ip_address=ip_address,
        user_agent=user_agent,
        timestamp=datetime.utcnow()
    )
    db.add(admin_log)
    db.commit()
    db.refresh(admin_log)

@router.post("/", response_model=AdminLogResponse, status_code=status.HTTP_201_CREATED)
def create_admin_log(log: AdminLogCreate, db: Session = Depends(get_db), current_user=Depends(get_current_active_admin)):
    db_log = AdminLog(
        admin_id=current_user.id,
        action=log.action
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@router.get("/", response_model=list[AdminLogResponse])
def read_admin_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user=Depends(get_current_active_admin)):
    logs = db.query(AdminLog).offset(skip).limit(limit).all()
    return logs
