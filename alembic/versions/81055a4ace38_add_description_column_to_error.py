"""Add description column to error

Revision ID: 81055a4ace38
Revises: 
Create Date: 2025-04-28 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '81055a4ace38'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add description column to error table
    op.add_column('error', sa.Column('description', sa.Text(), nullable=False, server_default='Описание отсутствует'))


def downgrade():
    op.drop_column('error', 'description')
