"""merge heads

Revision ID: cddba130df2f
Revises: 62f403addbd5, add_sadmin_admin_columns_to_user
Create Date: 2025-05-05 15:05:14.534481

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cddba130df2f'
down_revision: Union[str, None] = ('62f403addbd5', 'add_sadmin_admin_columns_to_user')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
