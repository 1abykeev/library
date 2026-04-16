from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.models.book_model import Book
from app.models.borrow_model import Borrow


class BookRepository:
    def __init__(self, db: Session):
        self.db = db

    def _attach_ratings(self, books: list[Book]) -> list[Book]:
        if not books:
            return books
        ids = [b.id for b in books]
        stmt = (
            select(
                Borrow.book_id,
                func.avg(Borrow.rating).label("avg"),
                func.count(Borrow.rating).label("cnt"),
            )
            .where(Borrow.book_id.in_(ids), Borrow.rating.isnot(None))
            .group_by(Borrow.book_id)
        )
        rows = self.db.execute(stmt).all()
        stats = {r.book_id: (float(r.avg), int(r.cnt)) for r in rows}
        for b in books:
            avg, cnt = stats.get(b.id, (0.0, 0))
            setattr(b, "avg_rating", round(avg, 2))
            setattr(b, "rating_count", cnt)
        return books

    def list_all(self, q: str | None = None, category_id: int | None = None) -> list[Book]:
        stmt = select(Book).options(joinedload(Book.category)).order_by(Book.created_at.desc())
        if q:
            like = f"%{q}%"
            stmt = stmt.where(or_(Book.title.ilike(like), Book.author.ilike(like)))
        if category_id:
            stmt = stmt.where(Book.category_id == category_id)
        books = list(self.db.execute(stmt).scalars())
        return self._attach_ratings(books)

    def get(self, book_id: int) -> Book | None:
        stmt = select(Book).options(joinedload(Book.category)).where(Book.id == book_id)
        book = self.db.execute(stmt).scalar_one_or_none()
        if book:
            self._attach_ratings([book])
        return book

    def create(self, **kwargs) -> Book:
        book = Book(**kwargs)
        self.db.add(book)
        self.db.commit()
        self.db.refresh(book)
        self._attach_ratings([book])
        return book

    def update(self, book: Book, data: dict) -> Book:
        for k, v in data.items():
            setattr(book, k, v)
        self.db.commit()
        self.db.refresh(book)
        self._attach_ratings([book])
        return book

    def delete(self, book: Book) -> None:
        self.db.delete(book)
        self.db.commit()

    def save(self, book: Book) -> Book:
        self.db.commit()
        self.db.refresh(book)
        self._attach_ratings([book])
        return book
