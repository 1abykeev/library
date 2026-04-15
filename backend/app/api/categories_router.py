from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth_dependencies import require_admin
from app.schemas.category_schema import CategoryCreate, CategoryOut, CategoryUpdate
from app.services.category_service import CategoryService

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return CategoryService(db).list_all()


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_category(data: CategoryCreate, db: Session = Depends(get_db)):
    return CategoryService(db).create(data.name)


@router.put("/{category_id}", response_model=CategoryOut, dependencies=[Depends(require_admin)])
def update_category(category_id: int, data: CategoryUpdate, db: Session = Depends(get_db)):
    return CategoryService(db).update(category_id, data.name)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_category(category_id: int, db: Session = Depends(get_db)):
    CategoryService(db).delete(category_id)
