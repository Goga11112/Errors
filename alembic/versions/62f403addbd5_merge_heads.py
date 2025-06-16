"""merge heads

Revision ID: 62f403addbd5
Revises: 20250430_sync_models_fix, bba09d885e3e
Create Date: 2025-05-05 09:45:50.835268

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '62f403addbd5'
down_revision: Union[str, None] = ('20250430_sync_models_fix', 'bba09d885e3e')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
