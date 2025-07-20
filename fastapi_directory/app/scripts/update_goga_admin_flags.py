from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.user import User

def update_goga_admin_flags():
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.username == "Goga").first()
        if not user:
            print("Пользователь Goga не найден")
            return
        user.admin = True
        user.sadmin = True
        db.commit()
        print("Флаги admin и sadmin для пользователя Goga обновлены")
    finally:
        db.close()

if __name__ == "__main__":
    update_goga_admin_flags()
