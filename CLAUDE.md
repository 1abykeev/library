# CLAUDE.md

Comprehensive reference for the Library Management System — a Russian-language university demo. Read this before touching any file.

---

## Project Overview

Full-stack library management system. Admin-only auth — clients never sign in. Admin manages the book catalog, issues books to walk-in clients (capturing their contact info), and records a 1–5 rating + review on return. Inspired by mybook.ru but minimalist.

**Stack:**
- Backend: FastAPI + SQLAlchemy 2.0 + Alembic + PostgreSQL, JWT auth (bcrypt via passlib)
- Frontend: Next.js 14 App Router + TypeScript + Tailwind CSS. No UI library — custom components only.

**All UI text is in Russian. Keep it that way.**

---

## Directory Structure

```
codebase/
├── backend/
│   ├── app/
│   │   ├── api/             # Route handlers (thin — delegate to services)
│   │   ├── core/            # config.py (settings), security.py (JWT helpers)
│   │   ├── db/              # database.py (Base, engine), session.py (get_db dep)
│   │   ├── dependencies/    # auth_dependencies.py (get_current_user, require_admin)
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── repositories/    # DB query layer (called by services)
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── services/        # Business logic layer
│   │   └── main.py          # App factory, CORS, mounts, router registration
│   ├── alembic/             # Migrations
│   │   └── versions/        # 0001–0004 migration files
│   ├── uploads/
│   │   ├── covers/          # Book cover images (UUID filenames)
│   │   └── pdfs/            # Book PDF files (UUID filenames)
│   ├── requirements.txt
│   ├── run.py               # uvicorn entrypoint
│   └── .env                 # DATABASE_URL, SECRET_KEY, etc.
└── frontend/
    ├── app/                 # Next.js App Router pages
    ├── components/          # Shared React components
    ├── lib/                 # api.ts, auth.ts utilities
    ├── next.config.js
    └── package.json
```

---

## Backend Architecture

**Request flow:** `api/` router → `services/` (business logic) → `repositories/` (DB queries) → `models/` (ORM).  
Pydantic schemas live in `schemas/`. DB session injected via `db/session.py:get_db`. Auth deps in `dependencies/auth_dependencies.py`.

### app/main.py

```
FastAPI(title="Библиотека", version="1.0.0")

Middleware:
  CORSMiddleware → allow_origins=["http://localhost:3000"], allow_credentials=True, methods=["*"], headers=["*"]

Static mount:
  /uploads → ./uploads   (serves cover images and PDFs)

Routers (in order):
  /auth        → auth_router
  /categories  → categories_router
  /books       → books_router
  /borrow      → borrow_router
  /stats       → stats_router

Health check:
  GET /health → {"status": "ok"}
```

CORS is hardcoded to `http://localhost:3000`. Change `main.py` if deploying elsewhere.

### core/config.py

Reads from `.env` via pydantic-settings:
- `DATABASE_URL` — PostgreSQL DSN (default: `postgresql+psycopg2://postgres:postgres@localhost:5432/library`)
- `SECRET_KEY` — JWT signing key (default: `"change-me-in-production"`)
- `ACCESS_TOKEN_EXPIRE_MINUTES` — Token TTL (default: 1440 = 24 hours)
- `UPLOAD_DIR` — Upload root (default: `./uploads`)

### core/security.py

JWT utilities using `python-jose` (HS256):
- `create_access_token(data, expires_delta)` — signs a JWT with role claim
- `decode_token(token)` — verifies and decodes; raises 401 on failure

### dependencies/auth_dependencies.py

- `oauth2_scheme` — `OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)`
- `get_current_user(token, db)` — validates JWT, loads `User` from DB; raises 401 if missing/invalid
- `require_admin(user)` — checks `user.role == "admin"`; raises 403 if not

---

## Database Models

### User (`users`)
| Column | Type | Notes |
|--------|------|-------|
| id | Integer PK | autoincrement |
| full_name | String(100) | NOT NULL |
| email | String(255) | UNIQUE, NOT NULL, indexed |
| password_hash | Text | NOT NULL |
| role | String(20) | default="user"; first user gets "admin" |
| created_at | DateTime(tz) | server_default=now() |

Relationships: `borrows` → one-to-many Borrow (cascade delete)

### Category (`categories`)
| Column | Type | Notes |
|--------|------|-------|
| id | Integer PK | autoincrement |
| name | String(100) | UNIQUE, NOT NULL |
| slug | String(120) | UNIQUE, NOT NULL, indexed |

Relationships: `books` → one-to-many Book

### Book (`books`)
| Column | Type | Notes |
|--------|------|-------|
| id | Integer PK | autoincrement |
| title | String(255) | NOT NULL, indexed |
| author | String(255) | NOT NULL, indexed |
| published_year | Integer | NOT NULL |
| description | Text | nullable |
| cover_url | String(500) | nullable; relative path under /uploads |
| pdf_url | String(500) | nullable; relative path under /uploads |
| available | Boolean | default=True; managed by borrow service only |
| category_id | Integer FK | → categories.id, ondelete=SET NULL, nullable |
| created_at | DateTime(tz) | server_default=now() |

Relationships: `category` → many-to-one Category; `borrows` → one-to-many Borrow (cascade delete)

`avg_rating` and `rating_count` are **not columns** — they are computed in `BookRepository._attach_ratings()` from the Borrow table and injected as Python attributes before serialization. Never try to persist them.

### Borrow (`borrows`)
| Column | Type | Notes |
|--------|------|-------|
| id | Integer PK | autoincrement |
| user_id | Integer FK | → users.id, ondelete=SET NULL, **nullable** (admin who issued) |
| book_id | Integer FK | → books.id, ondelete=CASCADE, NOT NULL |
| borrow_date | DateTime(tz) | server_default=now() |
| return_date | DateTime(tz) | nullable; set at return time |
| borrower_name | String(100) | nullable |
| borrower_surname | String(100) | nullable |
| borrower_phone | String(40) | nullable |
| borrower_email | String(255) | nullable |
| borrower_passport | String(40) | nullable |
| note | Text | nullable |
| rating | Integer | nullable; 1–5; set at return time |
| review | Text | nullable; set at return time |

Relationships: `user` → many-to-one User; `book` → many-to-one Book

---

## Pydantic Schemas

### user_schema.py
- `UserRegister`: full_name (str 1–100), email (EmailStr), password (str 6–128)
- `UserLogin`: email (EmailStr), password (str)
- `UserOut`: id, full_name, email, role, created_at | `from_attributes=True`
- `Token`: access_token (str), token_type (default="bearer"), user (UserOut)

### book_schema.py
- `BookCreate`: title (1–255), author (1–255), published_year (0–2100), description (opt), category_id (opt)
- `BookUpdate`: all fields optional (same constraints as BookCreate) + available (bool, opt)
- `BookOut`: id, title, author, published_year, description, cover_url, pdf_url, available, category (CategoryOut|null), created_at, **avg_rating** (float, computed), **rating_count** (int, computed)
- `BookReview`: borrower_name, borrower_surname, rating, review, return_date

### borrow_schema.py
- `BorrowCreate`: book_id, borrower_name (1–100), borrower_surname (1–100), borrower_phone (3–40), borrower_email (opt), borrower_passport (opt), note (opt)
- `BorrowReturn`: rating (1–5, opt), review (opt)
- `BorrowBookInfo`: id, title, author | `from_attributes=True`
- `BorrowOut`: id, borrow_date, return_date, borrower_name, borrower_surname, borrower_phone, borrower_email, borrower_passport, note, rating, review, book (BorrowBookInfo)

### category_schema.py
- `CategoryCreate`: name (1–100)
- `CategoryUpdate`: name (1–100)
- `CategoryOut`: id, name, slug | `from_attributes=True`

### stats schemas (inline in stats_router.py)
- `DashboardStats`: total_books, available_books, total_borrows, active_borrows, total_categories, avg_rating, top_books (list of top 5 by borrow count)
- `ClientHistoryItem`: borrow id, book title, borrower full info, dates, rating, is_active flag

---

## API Routes

All routes return JSON. Auth = JWT Bearer token in `Authorization: Bearer <token>` header.

### /auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Create first (and only) admin. Returns `UserOut`. Raises 403 if a user already exists. |
| POST | `/auth/login` | No | Login with email+password. Returns `Token` (JWT + user). |
| GET | `/auth/me` | Yes | Returns current `UserOut` from JWT. |

Registration is permanently locked after first admin exists. To reset in dev: `TRUNCATE users CASCADE;`.

### /categories

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/categories` | No | List all categories. Returns `list[CategoryOut]`. |
| POST | `/categories` | Admin | Create category. Slug auto-generated from Cyrillic name. Returns `CategoryOut`. |
| PUT | `/categories/{id}` | Admin | Rename category. Returns `CategoryOut`. Blocks renaming `free-books`. |
| DELETE | `/categories/{id}` | Admin | Delete category. Blocks deleting `free-books`. Returns 204. |

### /books

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/books` | No | List books. Query params: `q` (search title/author), `category_id`. Returns `list[BookOut]` with computed ratings. |
| GET | `/books/{id}` | No | Single book detail. Returns `BookOut`. |
| POST | `/books` | Admin | Create book. Body: `BookCreate`. Returns `BookOut`. |
| PUT | `/books/{id}` | Admin | Partial update. Body: `BookUpdate`. Returns `BookOut`. |
| DELETE | `/books/{id}` | Admin | Delete book + removes PDF/cover files from disk. Returns 204. |
| POST | `/books/{id}/pdf` | Admin | Upload PDF. Multipart `file` field. Validates `.pdf` extension. Saves to `./uploads/pdfs/<uuid>.pdf`. Returns `BookOut`. |
| POST | `/books/{id}/cover` | Admin | Upload cover image. Multipart `file` field. Validates `.jpg/.jpeg/.png/.webp`. Saves to `./uploads/covers/<uuid>.<ext>`. Returns `BookOut`. |

`Book.available` is managed exclusively by the borrow service — never set it directly via `BookUpdate`.

### /borrow

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/borrow` | Admin | List all borrow records (with book info), ordered by date desc. Returns `list[BorrowOut]`. |
| POST | `/borrow` | Admin | Issue book to client. Body: `BorrowCreate`. Sets `book.available = False`. Returns `BorrowOut`. |
| POST | `/borrow/{id}/return` | Admin | Return book. Body: `BorrowReturn` (optional rating 1–5 + review). Sets `return_date = now()`, `book.available = True`. Returns `BorrowOut`. |

### /stats

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/stats/dashboard` | Admin | Dashboard stats: total/available books, borrow counts, avg rating, top 5 books. Returns `DashboardStats`. |
| GET | `/stats/clients` | Admin | All borrow records with full borrower info for client history table. |
| GET | `/stats/books/{id}/reviews` | No | Public reviews for a book — all Borrow rows where rating is not null, ordered by return_date desc. Returns `list[BookReview]`. |

---

## Services

### auth_service.py
- `register(data)` — Checks `user_repo.count() == 0` (raises 403 otherwise), validates email uniqueness, hashes password with bcrypt, creates user with `role="admin"`.
- `login(data)` — Fetches user by email, `passlib.verify()` against hash, calls `create_access_token` with `sub=user.id, role=user.role`.

### book_service.py
- `list_books(q, category_id)` — Passes to repo.
- `get_book(book_id)` — Repo fetch or raises 404.
- `create_book(data)` — Repo create.
- `update_book(book_id, data)` — `data.model_dump(exclude_unset=True)` → repo update (partial).
- `delete_book(book_id)` — Removes `pdf_url` and `cover_url` files from disk then repo delete.
- `upload_pdf(book_id, file)` — Extension whitelist: `.pdf`. UUID filename → `./uploads/pdfs/`. Updates `book.pdf_url`.
- `upload_cover(book_id, file)` — Extension whitelist: `.jpg .jpeg .png .webp`. UUID filename → `./uploads/covers/`. Updates `book.cover_url`.

### borrow_service.py
- `list_all()` — Repo fetch all.
- `issue(data, admin_user_id)` — Creates Borrow row, sets `book.available = False`, saves.
- `return_book(borrow_id, data)` — Fetches borrow, sets `return_date`, copies `rating`/`review` from body, sets `book.available = True`, saves.

### category_service.py
- `list_all()` — Repo fetch all.
- `create(name)` — Calls `slugify(name)`, checks slug uniqueness, repo create.
- `update(category_id, name)` — Blocks if `category.slug == "free-books"`. Regenerates slug, repo update.
- `delete(category_id)` — Blocks if `category.slug == "free-books"`. Repo delete.
- `slugify(name)` — Cyrillic → ASCII transliteration, lowercase, spaces to hyphens.

---

## Repositories

### user_repository.py
- `get_by_id(id)` → User | None
- `get_by_email(email)` → User | None
- `create(full_name, email, password_hash, role)` → User (committed)
- `count()` → int

### book_repository.py
- `_attach_ratings(books)` — Subquery on Borrow table: `avg(rating)`, `count(rating)` grouped by `book_id`. Sets `book.avg_rating` and `book.rating_count` as Python attrs.
- `list_all(q, category_id)` → list[Book] with ratings attached
- `get(book_id)` → Book with ratings | raises 404
- `create(**kwargs)` → Book with ratings
- `update(book, data)` → Book with ratings
- `delete(book)` — Commits deletion
- `save(book)` → Book with ratings (commit + refresh)

### borrow_repository.py
- `list_all()` → list[Borrow] with book eagerly loaded, ordered by borrow_date desc
- `get(borrow_id)` → Borrow with book | raises 404
- `save(borrow)` → Borrow (commit + refresh)

### category_repository.py
- `list_all()` → list[Category] ordered by name
- `get(category_id)` → Category | raises 404
- `get_by_slug(slug)` → Category | None
- `create(name, slug)` → Category
- `update(category, name, slug)` → Category
- `delete(category)` — Commits deletion

---

## Frontend

### lib/api.ts

Central HTTP client — **use `api()` for every fetch, never raw `fetch()`**.

- `API_URL` — `process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"`
- `getToken()` / `setToken(t)` / `clearToken()` — localStorage JWT management
- `getStoredUser()` / `setStoredUser(u)` — localStorage user cache
- `ApiError` — custom Error subclass with `.status: number`
- `api<T>(path, opts?)` — Generic fetch wrapper:
  - Attaches `Authorization: Bearer <token>` if token exists
  - Serializes plain objects as JSON (`Content-Type: application/json`); passes FormData as-is
  - On 401: clears token + redirects to `/login`
  - On error: throws `ApiError(message, status)`
  - Returns parsed JSON as `T`
- `mediaUrl(path)` — Prepends `API_URL` to relative upload paths (e.g. `/uploads/covers/x.jpg` → full URL)

**TypeScript types defined here:** `User`, `Category`, `Book`, `BookReview`, `Borrow`

### lib/auth.ts

- `useCurrentUser(options?)` — React hook:
  - Calls `GET /auth/me` on mount, caches result in localStorage
  - `options.required` → redirects to `/login` if no token / request fails
  - `options.adminOnly` → redirects to `/books` if user is not admin
  - Returns `{ user: User | null, loading: boolean }`
- `logout(router)` — Calls `clearToken()` + `router.push("/login")`

---

## Frontend Pages

Public pages use `<PublicShell>` (PublicNavbar + Footer). Admin pages use `<Shell required adminOnly>`.

| Route | File | Shell | Description |
|-------|------|-------|-------------|
| `/` | `app/page.tsx` | PublicShell | Landing page — hero, feature highlights, CTA |
| `/login` | `app/login/page.tsx` | None | Login form → redirects to `/admin` on success |
| `/register` | `app/register/page.tsx` | None | Registration form → redirects to `/login` on success |
| `/catalog` | `app/catalog/page.tsx` | PublicShell | Public book catalog — search bar, category filter tabs, BookCard grid |
| `/catalog/[id]` | `app/catalog/[id]/page.tsx` | PublicShell | Public book detail — cover, description, Stars, reviews list, download/read links for free books |
| `/books` | `app/books/page.tsx` | Shell (required) | Authenticated catalog — same as /catalog but with admin add-book button |
| `/books/[id]` | `app/books/[id]/page.tsx` | Shell (required) | Book detail — edit/delete buttons (admin), Read button if pdf_url exists |
| `/books/[id]/read` | `app/books/[id]/read/page.tsx` | Shell (required) | Full-screen PDF reader via `<iframe>` with dark background |
| `/admin` | `app/admin/page.tsx` | Shell (adminOnly) | Dashboard — stat cards (total/available books, borrows, avg rating), top 5 books table, client history table with search/filter |
| `/admin/books/new` | `app/admin/books/new/page.tsx` | Shell (adminOnly) | Create book form — title, author, year, category dropdown, description, cover + PDF upload |
| `/admin/books/[id]` | `app/admin/books/[id]/page.tsx` | Shell (adminOnly) | Edit book form — all fields + replace cover/PDF |
| `/admin/categories` | `app/admin/categories/page.tsx` | Shell (adminOnly) | Category CRUD table — add/rename/delete, protects "Бесплатные книги" |
| `/borrow` | `app/borrow/page.tsx` | Shell (adminOnly) | Borrow management — issue form (borrower info + book), active borrows table, return modal with StarInput |
| `/free` | `app/free/page.tsx` | PublicShell | Free books catalog — filtered to "free-books" category, direct read/download links |
| `/about` | `app/about/page.tsx` | PublicShell | Static about page — mission, principles |
| `/contacts` | `app/contacts/page.tsx` | PublicShell | Static contact info — address, hours, phone, email |
| `/faq` | `app/faq/page.tsx` | PublicShell | FAQ accordion |

Post-login landing is `/admin` (the dashboard), not `/books`.

---

## Frontend Components

| Component | File | Description |
|-----------|------|-------------|
| `BookCard` | `components/BookCard.tsx` | Book card — cover image, title, author, year, availability badge, category badge, Stars rating |
| `Shell` | `components/Shell.tsx` | Auth-gated layout wrapper. Props: `required` (redirect to /login if unauthed), `adminOnly` (redirect if not admin). Renders Navbar + `<main>` |
| `PublicShell` | `components/PublicShell.tsx` | Public layout wrapper — PublicNavbar + Footer + `<main>` |
| `Navbar` | `components/Navbar.tsx` | Admin navbar — logo, links (panel/catalog/borrows/categories), user dropdown with logout |
| `PublicNavbar` | `components/PublicNavbar.tsx` | Public navbar — logo, links (home/catalog/free/about/faq/contacts), "Войти" button |
| `Footer` | `components/Footer.tsx` | Footer — company info, nav sections, address/contact, copyright |
| `Stars` | `components/Stars.tsx` | Read-only star display (★★★☆☆). Props: `value` (float), `count` (optional), `size` (sm/md/lg) |
| `StarInput` | `components/Stars.tsx` | Interactive star picker — click/hover. Props: `value`, `onChange` |

---

## Alembic Migrations

| File | What it does |
|------|-------------|
| `0001_initial.py` | Creates all four tables: users, categories, books, borrows with base columns |
| `0002_seed_free_books.py` | Seeds the protected «Бесплатные книги» category with slug `free-books`. **Do not remove.** |
| `0003_borrower_info.py` | Makes `borrows.user_id` nullable; adds borrower_name/surname/phone/email/passport/note columns |
| `0004_borrow_rating.py` | Adds `rating` (Integer) and `review` (Text) columns to borrows |

`alembic/env.py` imports `app.models` to register metadata — do not remove that import.

---

## Running Locally

**Backend:**
```bash
cd backend
# Create backend/.env with DATABASE_URL and SECRET_KEY
alembic upgrade head
python run.py          # starts uvicorn on :8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev            # starts Next.js on :3000
```

---

## Requirements

```
fastapi==0.115.0
uvicorn[standard]==0.30.6
sqlalchemy==2.0.35
alembic==1.13.3
psycopg2-binary==2.9.10        # pinned for Python 3.13 wheel support
pydantic==2.9.2
pydantic-settings==2.5.2
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
bcrypt==4.0.1                  # must be pinned — newer versions break passlib
python-multipart==0.0.12
email-validator==2.2.0
python-dotenv==1.0.1
```

---

## Key Rules & Gotchas

- **One admin only.** `auth_service.register` raises 403 once `users` is non-empty. To reset in dev: `TRUNCATE users CASCADE;`
- **`free-books` slug is protected.** `category_service` blocks rename and delete of that category. Migration `0002` seeds it — don't remove.
- **`Book.available` is borrow-service-owned.** Never set it via `BookUpdate`. Only `issue()` and `return_book()` touch it.
- **`avg_rating` / `rating_count` are computed.** They live on `BookOut` but not on the `books` table. `BookRepository._attach_ratings` injects them as Python attrs.
- **Clients don't authenticate.** `Borrow.user_id` records the admin who issued; borrower identity lives in the `borrower_*` fields.
- **File extension whitelist** enforced in `book_service.py`: PDFs only for `/pdf`, `.jpg/.jpeg/.png/.webp` for `/cover`.
- **CORS** hardcoded to `http://localhost:3000` in `main.py`.
- **`bcrypt==4.0.1` must stay pinned** — newer bcrypt breaks the `passlib[bcrypt]` combo.
- **`psycopg2-binary==2.9.10` must stay pinned** — for Python 3.13 wheel support.
- **Frontend env var:** Set `NEXT_PUBLIC_API_URL` to override the default backend URL (`http://localhost:8000`).
- **`mediaUrl(path)`** in `lib/api.ts` must be used to resolve cover/PDF URLs — they are stored as relative paths.
