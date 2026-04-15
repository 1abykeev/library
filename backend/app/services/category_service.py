import re

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.category_repository import CategoryRepository


def slugify(name: str) -> str:
    # basic transliteration for cyrillic
    ru_map = {
        "а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"e","ж":"zh","з":"z",
        "и":"i","й":"y","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r",
        "с":"s","т":"t","у":"u","ф":"f","х":"h","ц":"ts","ч":"ch","ш":"sh","щ":"sch",
        "ъ":"","ы":"y","ь":"","э":"e","ю":"yu","я":"ya"," ":"-"
    }
    s = "".join(ru_map.get(ch, ch) for ch in name.lower())
    s = re.sub(r"[^a-z0-9\-]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s or "category"


class CategoryService:
    def __init__(self, db: Session):
        self.repo = CategoryRepository(db)

    def list_all(self):
        return self.repo.list_all()

    def create(self, name: str):
        slug = slugify(name)
        if self.repo.get_by_slug(slug):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Категория уже существует")
        return self.repo.create(name=name, slug=slug)

    def update(self, category_id: int, name: str):
        cat = self.repo.get(category_id)
        if not cat:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Категория не найдена")
        slug = slugify(name)
        return self.repo.update(cat, name, slug)

    def delete(self, category_id: int):
        cat = self.repo.get(category_id)
        if not cat:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Категория не найдена")
        self.repo.delete(cat)
