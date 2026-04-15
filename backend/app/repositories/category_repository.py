from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.category_model import Category


class CategoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_all(self) -> list[Category]:
        return list(self.db.execute(select(Category).order_by(Category.name)).scalars())

    def get(self, category_id: int) -> Category | None:
        return self.db.get(Category, category_id)

    def get_by_slug(self, slug: str) -> Category | None:
        return self.db.execute(select(Category).where(Category.slug == slug)).scalar_one_or_none()

    def create(self, name: str, slug: str) -> Category:
        c = Category(name=name, slug=slug)
        self.db.add(c)
        self.db.commit()
        self.db.refresh(c)
        return c

    def update(self, category: Category, name: str, slug: str) -> Category:
        category.name = name
        category.slug = slug
        self.db.commit()
        self.db.refresh(category)
        return category

    def delete(self, category: Category) -> None:
        self.db.delete(category)
        self.db.commit()
