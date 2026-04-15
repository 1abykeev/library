from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth_dependencies import get_current_user, require_admin
from app.models.user_model import User
from app.schemas.borrow_schema import BorrowCreate, BorrowOut
from app.services.borrow_service import BorrowService

router = APIRouter(prefix="/borrow", tags=["borrow"])


@router.get("", response_model=list[BorrowOut])
def list_borrows(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    svc = BorrowService(db)
    if user.role == "admin":
        return svc.list_all()
    return svc.list_for_user(user.id)


@router.post("", response_model=BorrowOut, status_code=status.HTTP_201_CREATED)
def create_borrow(data: BorrowCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # non-admins can only borrow for themselves
    target_user_id = data.user_id if user.role == "admin" else user.id
    return BorrowService(db).issue(target_user_id, data.book_id)


@router.post("/{borrow_id}/return", response_model=BorrowOut)
def return_book(borrow_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return BorrowService(db).return_book(borrow_id)
