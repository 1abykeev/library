# CLAUDE.md

Guidance for future Claude Code sessions working on this repo.

## Project

Russian-language university demo: a full-stack library management system. Admin-only auth — clients never sign in. Admin manages catalog, issues books to walk-in clients (capturing their contact info), and records a 1–5 rating + review on return. Inspired by mybook.ru but minimalist.

## Stack

- **Backend:** FastAPI + SQLAlchemy 2.0 + Alembic + PostgreSQL, JWT auth (bcrypt via passlib).
- **Frontend:** Next.js 14 App Router + TypeScript + Tailwind. No UI library — custom components in `frontend/components`.

## Architecture

Layered backend: `api/` → `services/` → `repositories/` → `models/`. Pydantic schemas in `schemas/`. DB session dependency in `db/session.py`. Auth deps in `dependencies/auth_dependencies.py` (`get_current_user`, `require_admin`).

Routers: `auth`, `books`, `categories`, `borrow`, `stats`. The `stats` router powers the admin dashboard (`/stats/dashboard`, `/stats/clients`) and public book reviews (`/stats/books/{id}/reviews`).

Uploads served from `backend/uploads/` mounted at `/uploads`. The frontend resolves relative URLs via `lib/api.ts:mediaUrl`.

Ratings live on the `Borrow` row (set at return time). Aggregate `avg_rating` + `rating_count` are computed in `BookRepository._attach_ratings` and injected onto `Book` instances before serialization — not stored on the Book.

Frontend shells: admin pages use `<Shell required adminOnly>`; public pages use `<PublicShell>` (includes `PublicNavbar` + `Footer`). The `Stars` component has two exports: `<Stars>` for display and `<StarInput>` for picking.

## Conventions

- All UI text is in Russian. Keep it that way.
- Only one admin ever exists. `auth_service.register` raises 403 once `users` is non-empty; the first (and only) user gets `role="admin"`.
- Clients do not authenticate. `Borrow.user_id` is nullable; borrower identity is captured via `borrower_name/surname/phone/email/passport/note` at issue time.
- Return flow requires a `BorrowReturn` body with optional `rating` (1–5) + `review` — set in `borrow_service.return_book`.
- Slugs for categories are transliterated from Cyrillic in `services/category_service.py`. The `free-books` slug is reserved: `category_service` blocks rename/delete.
- Migration `0002` seeds the protected «Бесплатные книги» category. Don't remove it.
- File uploads validated by extension whitelist in `services/book_service.py`.
- Use `api()` helper from `lib/api.ts` for all fetches — it handles auth headers and 401 redirects.
- Post-login landing is `/admin` (the dashboard), not `/books`.

## Running

Backend: create `backend/.env` with `DATABASE_URL` + `SECRET_KEY`, then `alembic upgrade head && python run.py`.
Frontend: `npm install && npm run dev` in `frontend/`.

## Things to watch

- CORS is hardcoded to `http://localhost:3000` in `app/main.py`.
- `python-jose` + `passlib[bcrypt]` combo requires `bcrypt==4.0.1` pinned (newer bcrypt breaks passlib).
- `psycopg2-binary` pinned to 2.9.10 for Python 3.13 wheel support.
- Alembic env.py imports `app.models` to register metadata — don't remove that import.
- `Book.available` flag is managed by borrow service, not edited directly.
- `avg_rating` / `rating_count` on `BookOut` are computed — don't try to persist them on the model.
- Registration is permanently locked after the first admin exists. To reset in dev, truncate the `users` table.
