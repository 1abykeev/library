from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Borrow(Base):
    __tablename__ = "borrows"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    book_id: Mapped[int] = mapped_column(ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    borrow_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    return_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    borrower_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    borrower_surname: Mapped[str | None] = mapped_column(String(100), nullable=True)
    borrower_phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    borrower_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    borrower_passport: Mapped[str | None] = mapped_column(String(40), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    review: Mapped[str | None] = mapped_column(Text, nullable=True)

    user = relationship("User", back_populates="borrows")
    book = relationship("Book", back_populates="borrows")
