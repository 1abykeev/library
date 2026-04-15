from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.book_repository import BookRepository
from app.repositories.borrow_repository import BorrowRepository
from app.repositories.user_repository import UserRepository


class BorrowService:
    def __init__(self, db: Session):
        self.db = db
        self.borrow_repo = BorrowRepository(db)
        self.book_repo = BookRepository(db)
        self.user_repo = UserRepository(db)

    def list_all(self):
        return self.borrow_repo.list_all()

    def list_for_user(self, user_id: int):
        return self.borrow_repo.list_for_user(user_id)

    def issue(self, user_id: int, book_id: int):
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Пользователь не найден")
        book = self.book_repo.get(book_id)
        if not book:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Книга не найдена")
        if not book.available:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Книга уже выдана")
        book.available = False
        self.book_repo.save(book)
        return self.borrow_repo.create(user_id=user_id, book_id=book_id)

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
