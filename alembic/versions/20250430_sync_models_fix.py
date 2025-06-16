"""Fix migration to sync models without dropping tables

Revision ID: 20250430_sync_models_fix
Revises: f663919fd8ac
Create Date: 2025-04-30 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250430_sync_models_fix'
down_revision = 'f663919fd8ac'
branch_labels = None
depends_on = None

def upgrade():
    op.execute(
        "CREATE TABLE IF NOT EXISTS roles ("
        "id SERIAL PRIMARY KEY, "
        "name VARCHAR UNIQUE, "
        "description VARCHAR"
        ");"
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_roles_name ON roles (name);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_roles_id ON roles (id);")

    op.execute(
        "CREATE TABLE IF NOT EXISTS error ("
        "id SERIAL PRIMARY KEY, "
        "name VARCHAR UNIQUE, "
        "description TEXT"
        ");"
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_error_name ON error (name);")

    op.execute(
        "CREATE TABLE IF NOT EXISTS \"user\" ("
        "id SERIAL PRIMARY KEY, "
        "username VARCHAR, "
        "realname VARCHAR, "
        "password_hash VARCHAR, "
        "role_id INTEGER REFERENCES roles(id)"
        ");"
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_user_username ON \"user\" (username);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_user_realname ON \"user\" (realname);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_user_password_hash ON \"user\" (password_hash);")

    op.execute(
        "CREATE TABLE IF NOT EXISTS error_images ("
        "id SERIAL PRIMARY KEY, "
        "error_id INTEGER REFERENCES error(id), "
        "image_url VARCHAR NOT NULL"
        ");"
    )

def downgrade():
    op.execute("DROP TABLE IF EXISTS error_images;")
    op.execute("DROP TABLE IF EXISTS \"user\";")
    op.execute("DROP TABLE IF EXISTS error;")
    op.execute("DROP TABLE IF EXISTS roles;")
