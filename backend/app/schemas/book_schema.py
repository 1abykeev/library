from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.category_schema import CategoryOut


class BookCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    author: str = Field(min_length=1, max_length=255)
    published_year: int = Field(ge=0, le=2100)
    description: str | None = None
    category_id: int | None = None


class BookUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    author: str | None = Field(default=None, min_length=1, max_length=255)
    published_year: int | None = Field(default=None, ge=0, le=2100)
    description: str | None = None
    category_id: int | None = None
    available: bool | None = None


class BookOut(BaseModel):
    id: int
    title: str
    author: str
    published_year: int
    description: str | None
    cover_url: str | None
    pdf_url: str | None
    available: bool
    category: CategoryOut | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
