"""seed protected free-books category

Revision ID: 0002_seed_free_books
Revises: 0001_initial
Create Date: 2026-04-16

"""
from typing import Sequence, Union

from alembic import op


revision: str = "0002_seed_free_books"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "INSERT INTO categories (name, slug) VALUES ('Бесплатные книги', 'free-books') "
        "ON CONFLICT (slug) DO NOTHING"
    )


def downgrade() -> None:
    op.execute("DELETE FROM categories WHERE slug = 'free-books'")
