from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.borrow_model import Borrow
from app.repositories.book_repository import BookRepository
from app.repositories.borrow_repository import BorrowRepository
from app.schemas.borrow_schema import BorrowCreate


class BorrowService:
    def __init__(self, db: Session):
        self.db = db
        self.borrow_repo = BorrowRepository(db)
        self.book_repo = BookRepository(db)

    def list_all(self):
        return self.borrow_repo.list_all()

    def issue(self, data: BorrowCreate, admin_user_id: int | None = None):
        book = self.book_repo.get(data.book_id)
        if not book:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Книга не найдена")
        if not book.available:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Книга уже выдана")
        book.available = False
        self.book_repo.save(book)

        b = Borrow(
            book_id=data.book_id,
            user_id=admin_user_id,
            borrower_name=data.borrower_name,
            borrower_surname=data.borrower_surname,
            borrower_phone=data.borrower_phone,
            borrower_email=data.borrower_email,
            borrower_passport=data.borrower_passport,
            note=data.note,
        )
        self.db.add(b)
        self.db.commit()
        self.db.refresh(b)
        return b

    def return_book(self, borrow_id: int):
        borrow = self.borrow_repo.get(borrow_id)
        if not borrow:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Запись о выдаче не найдена")
        if borrow.return_date is not None:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Книга уже возвращена")
        borrow.return_date = datetime.now(timezone.utc)
        book = self.book_repo.get(borrow.book_id)
        if book:
            book.available = True
            self.book_repo.save(book)
        return self.borrow_repo.save(borrow)
