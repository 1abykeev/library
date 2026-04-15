from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BorrowCreate(BaseModel):
    book_id: int
    borrower_name: str = Field(min_length=1, max_length=100)
    borrower_surname: str = Field(min_length=1, max_length=100)
    borrower_phone: str = Field(min_length=3, max_length=40)
    borrower_email: str | None = None
    borrower_passport: str | None = None
    note: str | None = None


class BorrowBookInfo(BaseModel):
    id: int
    title: str
    author: str

    model_config = ConfigDict(from_attributes=True)


class BorrowOut(BaseModel):
    id: int
    borrow_date: datetime
    return_date: datetime | None
    borrower_name: str | None
    borrower_surname: str | None
    borrower_phone: str | None
    borrower_email: str | None
    borrower_passport: str | None
    note: str | None
    book: BorrowBookInfo

    model_config = ConfigDict(from_attributes=True)
