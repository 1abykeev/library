from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth_dependencies import require_admin
from app.models.user_model import User
from app.schemas.borrow_schema import BorrowCreate, BorrowOut, BorrowReturn
from app.services.borrow_service import BorrowService

router = APIRouter(prefix="/borrow", tags=["borrow"])


@router.get("", response_model=list[BorrowOut], dependencies=[Depends(require_admin)])
def list_borrows(db: Session = Depends(get_db)):
    return BorrowService(db).list_all()


@router.post("", response_model=BorrowOut, status_code=status.HTTP_201_CREATED)
def create_borrow(data: BorrowCreate, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return BorrowService(db).issue(data, admin_user_id=admin.id)


@router.post("/{borrow_id}/return", response_model=BorrowOut, dependencies=[Depends(require_admin)])
def return_book(borrow_id: int, data: BorrowReturn, db: Session = Depends(get_db)):
    return BorrowService(db).return_book(borrow_id, data)
