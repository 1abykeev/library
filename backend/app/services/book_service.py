import os
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.repositories.book_repository import BookRepository
from app.schemas.book_schema import BookCreate, BookUpdate


ALLOWED_PDF = {".pdf"}
ALLOWED_IMG = {".jpg", ".jpeg", ".png", ".webp"}


def _save_upload(file: UploadFile, subdir: str, allowed: set[str]) -> str:
    ext = Path(file.filename or "").suffix.lower()
    if ext not in allowed:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Недопустимое расширение файла: {ext}")
    target_dir = Path(settings.UPLOAD_DIR) / subdir
    target_dir.mkdir(parents=True, exist_ok=True)
    name = f"{uuid.uuid4().hex}{ext}"
    path = target_dir / name
    with path.open("wb") as f:
        f.write(file.file.read())
    return f"/uploads/{subdir}/{name}"


class BookService:
    def __init__(self, db: Session):
        self.repo = BookRepository(db)

    def list_books(self, q: str | None = None, category_id: int | None = None):
        return self.repo.list_all(q=q, category_id=category_id)

    def get_book(self, book_id: int):
        book = self.repo.get(book_id)
        if not book:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Книга не найдена")
        return book

    def create_book(self, data: BookCreate):
        return self.repo.create(**data.model_dump())

    def update_book(self, book_id: int, data: BookUpdate):
        book = self.get_book(book_id)
        updates = {k: v for k, v in data.model_dump(exclude_unset=True).items() if v is not None or k == "description"}
        return self.repo.update(book, updates)

    def delete_book(self, book_id: int):
        book = self.get_book(book_id)
        # also try removing files
        for rel in (book.pdf_url, book.cover_url):
            if rel and rel.startswith("/uploads/"):
                p = Path(settings.UPLOAD_DIR) / rel.replace("/uploads/", "", 1)
                if p.exists():
                    try:
                        os.remove(p)
                    except OSError:
                        pass
        self.repo.delete(book)

    def upload_pdf(self, book_id: int, file: UploadFile):
        book = self.get_book(book_id)
        url = _save_upload(file, "pdfs", ALLOWED_PDF)
        book.pdf_url = url
        return self.repo.save(book)

    def upload_cover(self, book_id: int, file: UploadFile):
        book = self.get_book(book_id)
        url = _save_upload(file, "covers", ALLOWED_IMG)
        book.cover_url = url
        return self.repo.save(book)
