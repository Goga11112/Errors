"""Add roles, users, errors and fix models

Revision ID: bba09d885e3e
Revises: 4446f366532d
Create Date: 2025-04-30 12:19:44.764824

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'bba09d885e3e'
down_revision: Union[str, None] = '4446f366532d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # No changes to avoid dropping existing tables
    pass


def downgrade() -> None:
    # No changes to avoid dropping existing tables
    pass
