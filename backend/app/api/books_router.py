from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth_dependencies import require_admin
from app.schemas.book_schema import BookCreate, BookOut, BookUpdate
from app.services.book_service import BookService

router = APIRouter(prefix="/books", tags=["books"])


@router.get("", response_model=list[BookOut])
def list_books(
    q: str | None = Query(default=None),
    category_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return BookService(db).list_books(q=q, category_id=category_id)


@router.get("/{book_id}", response_model=BookOut)
def get_book(book_id: int, db: Session = Depends(get_db)):
    return BookService(db).get_book(book_id)


@router.post("", response_model=BookOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_book(data: BookCreate, db: Session = Depends(get_db)):
    return BookService(db).create_book(data)


@router.put("/{book_id}", response_model=BookOut, dependencies=[Depends(require_admin)])
def update_book(book_id: int, data: BookUpdate, db: Session = Depends(get_db)):
    return BookService(db).update_book(book_id, data)


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_book(book_id: int, db: Session = Depends(get_db)):
    BookService(db).delete_book(book_id)


@router.post("/{book_id}/pdf", response_model=BookOut, dependencies=[Depends(require_admin)])
def upload_pdf(book_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    return BookService(db).upload_pdf(book_id, file)


@router.post("/{book_id}/cover", response_model=BookOut, dependencies=[Depends(require_admin)])
def upload_cover(book_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    return BookService(db).upload_cover(book_id, file)
