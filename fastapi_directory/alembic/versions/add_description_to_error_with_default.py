"""Add description column to error table with default values

Revision ID: add_description_to_error_with_default
Revises: 
Create Date: 2025-04-28 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy import String, Text
import random

# revision identifiers, used by Alembic.
revision = 'add_description_to_error_with_default'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Add description column with nullable=False and default value
    op.add_column('error', sa.Column('description', sa.Text(), nullable=False, server_default='Описание отсутствует'))

    # Update existing rows with random descriptions
    error_table = table('error',
        column('id', sa.Integer),
        column('description', sa.Text)
    )

    descriptions = [
        "Проблема с подключением к серверу.",
        "Ошибка валидации данных.",
        "Непредвиденная ошибка на стороне клиента.",
        "Проблема с базой данных.",
        "Ошибка авторизации пользователя.",
        "Сбой в работе API.",
        "Ошибка обработки запроса.",
        "Проблема с загрузкой изображения.",
        "Ошибка синхронизации данных.",
        "Проблема с правами доступа."
    ]

    conn = op.get_bind()
    results = conn.execute(sa.select([error_table.c.id]))
    for row in results:
        random_description = random.choice(descriptions)
        conn.execute(
            error_table.update().where(error_table.c.id == row.id).values(description=random_description)
        )

def downgrade():
    op.drop_column('error', 'description')
