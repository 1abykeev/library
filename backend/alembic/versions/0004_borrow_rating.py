"""add rating to borrow

Revision ID: 0004_borrow_rating
Revises: 0003_borrower_info
Create Date: 2026-04-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0004_borrow_rating"
down_revision: Union[str, None] = "0003_borrower_info"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("borrows", sa.Column("rating", sa.Integer, nullable=True))
    op.add_column("borrows", sa.Column("review", sa.Text, nullable=True))


def downgrade() -> None:
    op.drop_column("borrows", "review")
    op.drop_column("borrows", "rating")
