"""merge heads

Revision ID: 86652a3296b7
Revises: 20240606_add_solution_description_to_error, cddba130df2f
Create Date: 2025-05-23 11:45:37.673550

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '86652a3296b7'
down_revision: Union[str, None] = ('20240606_add_solution_description_to_error', 'cddba130df2f')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
