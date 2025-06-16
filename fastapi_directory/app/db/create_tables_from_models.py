import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

from app.db.database import Base, engine

# Import all models to register them with Base
from app.models import admin_log
from app.models import admin_logs
from app.models import alembic_version
from app.models import error
from app.models import error_topic
from app.models import role
from app.models import user

def create_tables():
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    create_tables()
