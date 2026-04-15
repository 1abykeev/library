from sqlalchemy import select, or_
from sqlalchemy.orm import Session, joinedload

from app.models.book_model import Book


class BookRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_all(self, q: str | None = None, category_id: int | None = None) -> list[Book]:
        stmt = select(Book).options(joinedload(Book.category)).order_by(Book.created_at.desc())
        if q:
            like = f"%{q}%"
            stmt = stmt.where(or_(Book.title.ilike(like), Book.author.ilike(like)))
        if category_id:
            stmt = stmt.where(Book.category_id == category_id)
        return list(self.db.execute(stmt).scalars())

    def get(self, book_id: int) -> Book | None:
        stmt = select(Book).options(joinedload(Book.category)).where(Book.id == book_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def create(self, **kwargs) -> Book:
        book = Book(**kwargs)
        self.db.add(book)
        self.db.commit()
        self.db.refresh(book)
        return book

    def update(self, book: Book, data: dict) -> Book:
        for k, v in data.items():
            setattr(book, k, v)
        self.db.commit()
        self.db.refresh(book)
        return book

    def delete(self, book: Book) -> None:
        self.db.delete(book)
        self.db.commit()

    def save(self, book: Book) -> Book:
        self.db.commit()
        self.db.refresh(book)
        return book
