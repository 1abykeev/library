from datetime import datetime

from pydantic import BaseModel, ConfigDict


class BorrowCreate(BaseModel):
    user_id: int
    book_id: int


class BorrowUserInfo(BaseModel):
    id: int
    full_name: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class BorrowBookInfo(BaseModel):
    id: int
    title: str
    author: str

    model_config = ConfigDict(from_attributes=True)


class BorrowOut(BaseModel):
    id: int
    borrow_date: datetime
    return_date: datetime | None
    user: BorrowUserInfo
    book: BorrowBookInfo

    model_config = ConfigDict(from_attributes=True)
