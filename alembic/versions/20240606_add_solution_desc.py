"""Add solution_description column to error table

Revision ID: 20240606_add_solution_desc
Revises: 
Create Date: 2024-06-06 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20240606_add_solution_desc'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('error', sa.Column('solution_description', sa.Text(), nullable=True))


def downgrade():
    op.drop_column('error', 'solution_description')
