from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.admins import router as admins_router
from app.api.errors import router as errors_router
from app.api.admin_log import router as admin_log_router
from app.api.roles import router as roles_router
from app.api.contact_info import router as contact_info_router

router = APIRouter()  # Вот так правильно

router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(users_router, prefix="/users", tags=["users"])
router.include_router(admins_router, prefix="/admins", tags=["admins"])
router.include_router(errors_router, prefix="/errors", tags=["errors"])
router.include_router(admin_log_router, prefix="/admin_logs", tags=["admin_logs"])
router.include_router(roles_router, prefix="/roles", tags=["roles"])
router.include_router(contact_info_router, prefix="/contact_info", tags=["contact_info"])
