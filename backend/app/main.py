from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import auth_router, books_router, borrow_router, categories_router
from app.core.config import settings

app = FastAPI(title="Библиотека", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

upload_dir = Path(settings.UPLOAD_DIR)
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")

app.include_router(auth_router.router)
app.include_router(categories_router.router)
app.include_router(books_router.router)
app.include_router(borrow_router.router)


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok"}
