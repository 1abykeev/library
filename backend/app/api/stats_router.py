from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.dependencies.auth_dependencies import require_admin
from app.models.book_model import Book
from app.models.borrow_model import Borrow
from app.models.category_model import Category
from app.schemas.book_schema import BookReview

router = APIRouter(prefix="/stats", tags=["stats"])


class TopBook(BaseModel):
    id: int
    title: str
    author: str
    count: int
    avg_rating: float


class ClientHistoryItem(BaseModel):
    borrow_id: int
    name: str
    surname: str
    phone: str | None
    email: str | None
    book_id: int
    book_title: str
    borrow_date: str
    return_date: str | None
    rating: int | None
    active: bool


class DashboardStats(BaseModel):
    total_books: int
    available_books: int
    total_borrows: int
    active_borrows: int
    total_categories: int
    avg_rating: float
    top_books: list[TopBook]


@router.get("/dashboard", response_model=DashboardStats, dependencies=[Depends(require_admin)])
def dashboard(db: Session = Depends(get_db)):
    total_books = db.scalar(select(func.count()).select_from(Book)) or 0
    available = db.scalar(select(func.count()).select_from(Book).where(Book.available.is_(True))) or 0
    total_borrows = db.scalar(select(func.count()).select_from(Borrow)) or 0
    active = db.scalar(select(func.count()).select_from(Borrow).where(Borrow.return_date.is_(None))) or 0
    total_cats = db.scalar(select(func.count()).select_from(Category)) or 0
    avg = db.scalar(select(func.avg(Borrow.rating)).where(Borrow.rating.isnot(None)))

    top_stmt = (
        select(
            Book.id,
            Book.title,
            Book.author,
            func.count(Borrow.id).label("cnt"),
            func.coalesce(func.avg(Borrow.rating), 0).label("avg"),
        )
        .join(Borrow, Borrow.book_id == Book.id)
        .group_by(Book.id)
        .order_by(func.count(Borrow.id).desc())
        .limit(5)
    )
    top = [
        TopBook(id=r.id, title=r.title, author=r.author, count=r.cnt, avg_rating=round(float(r.avg), 2))
        for r in db.execute(top_stmt).all()
    ]

    return DashboardStats(
        total_books=total_books,
        available_books=available,
        total_borrows=total_borrows,
        active_borrows=active,
        total_categories=total_cats,
        avg_rating=round(float(avg), 2) if avg else 0.0,
        top_books=top,
    )


@router.get("/clients", response_model=list[ClientHistoryItem], dependencies=[Depends(require_admin)])
def clients_history(db: Session = Depends(get_db)):
    stmt = (
        select(Borrow)
        .options(joinedload(Borrow.book))
        .order_by(Borrow.borrow_date.desc())
    )
    rows = list(db.execute(stmt).scalars())
    return [
        ClientHistoryItem(
            borrow_id=b.id,
            name=b.borrower_name or "",
            surname=b.borrower_surname or "",
            phone=b.borrower_phone,
            email=b.borrower_email,
            book_id=b.book_id,
            book_title=b.book.title if b.book else "",
            borrow_date=b.borrow_date.isoformat(),
            return_date=b.return_date.isoformat() if b.return_date else None,
            rating=b.rating,
            active=b.return_date is None,
        )
        for b in rows
    ]


@router.get("/books/{book_id}/reviews", response_model=list[BookReview])
def book_reviews(book_id: int, db: Session = Depends(get_db)):
    stmt = (
        select(Borrow)
        .where(Borrow.book_id == book_id, Borrow.rating.isnot(None))
        .order_by(Borrow.return_date.desc())
    )
    rows = list(db.execute(stmt).scalars())
    return [
        BookReview(
            borrower_name=b.borrower_name,
            borrower_surname=b.borrower_surname,
            rating=b.rating or 0,
            review=b.review,
            return_date=b.return_date,
        )
        for b in rows
    ]
