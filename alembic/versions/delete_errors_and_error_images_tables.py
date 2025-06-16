"""Delete errors and error_images tables

Revision ID: delete_errors_and_error_images
Revises: 81055a4ace38
Create Date: 2025-04-28 12:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'delete_errors_and_error_images'
down_revision = '81055a4ace38'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_table('error_images')
    op.drop_table('error')


def downgrade():
    op.create_table(
        'error',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String, unique=True, index=True),
        sa.Column('description', sa.Text, nullable=False, server_default='Описание отсутствует'),
    )
    op.create_table(
        'error_images',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('error_id', sa.Integer, sa.ForeignKey('error.id')),
        sa.Column('image_url', sa.String, nullable=False),
    )
