from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.borrow_model import Borrow


class BorrowRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_all(self) -> list[Borrow]:
        stmt = (
            select(Borrow)
            .options(joinedload(Borrow.book))
            .order_by(Borrow.borrow_date.desc())
        )
        return list(self.db.execute(stmt).scalars())

    def get(self, borrow_id: int) -> Borrow | None:
        stmt = select(Borrow).options(joinedload(Borrow.book)).where(Borrow.id == borrow_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def save(self, borrow: Borrow) -> Borrow:
        self.db.commit()
        self.db.refresh(borrow)
        return borrow
