"""Restore error table and delete errors table

Revision ID: restore_error_delete_errors
Revises: delete_errors_and_error_images
Create Date: 2025-04-28 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'restore_error_delete_errors'
down_revision = 'delete_errors_and_error_images'
branch_labels = None
depends_on = None


def upgrade():
    # Restore error table
    op.create_table(
        'error',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String, unique=True, index=True),
        sa.Column('description', sa.Text, nullable=False, server_default='Описание отсутствует'),
    )
    # Drop errors table if exists
    op.drop_table('errors')


def downgrade():
    # Drop error table
    op.drop_table('error')
    # Recreate errors table
    op.create_table(
        'errors',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String, unique=True, index=True),
        sa.Column('description', sa.Text, nullable=False, server_default='Описание отсутствует'),
    )
