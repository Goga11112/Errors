"""Add sadmin and admin columns to user table

Revision ID: add_sadmin_admin_columns_to_user
Revises: 
Create Date: 2025-05-05 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_sadmin_admin_columns_to_user'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('user', sa.Column('sadmin', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('user', sa.Column('admin', sa.Boolean(), nullable=False, server_default=sa.false()))


def downgrade():
    op.drop_column('user', 'sadmin')
    op.drop_column('user', 'admin')
