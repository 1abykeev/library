"""add borrower personal info to borrows

Revision ID: 0003_borrower_info
Revises: 0002_seed_free_books
Create Date: 2026-04-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0003_borrower_info"
down_revision: Union[str, None] = "0002_seed_free_books"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("borrows", "user_id", existing_type=sa.Integer(), nullable=True)
    op.add_column("borrows", sa.Column("borrower_name", sa.String(100), nullable=True))
    op.add_column("borrows", sa.Column("borrower_surname", sa.String(100), nullable=True))
    op.add_column("borrows", sa.Column("borrower_phone", sa.String(40), nullable=True))
    op.add_column("borrows", sa.Column("borrower_email", sa.String(255), nullable=True))
    op.add_column("borrows", sa.Column("borrower_passport", sa.String(40), nullable=True))
    op.add_column("borrows", sa.Column("note", sa.Text, nullable=True))


def downgrade() -> None:
    op.drop_column("borrows", "note")
    op.drop_column("borrows", "borrower_passport")
    op.drop_column("borrows", "borrower_email")
    op.drop_column("borrows", "borrower_phone")
    op.drop_column("borrows", "borrower_surname")
    op.drop_column("borrows", "borrower_name")
    op.alter_column("borrows", "user_id", existing_type=sa.Integer(), nullable=False)
