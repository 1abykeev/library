# CLAUDE.md

Guidance for future Claude Code sessions working on this repo.

## Project

Russian-language university demo: a full-stack library management system with admin PDF uploads and a reader. Inspired by mybook.ru but minimalist.

## Stack

- **Backend:** FastAPI + SQLAlchemy 2.0 + Alembic + PostgreSQL, JWT auth (bcrypt via passlib).
- **Frontend:** Next.js 14 App Router + TypeScript + Tailwind. No UI library — custom components in `frontend/components`.

## Architecture

Layered backend: `api/` → `services/` → `repositories/` → `models/`. Pydantic schemas in `schemas/`. DB session dependency in `db/session.py`. Auth deps in `dependencies/auth_dependencies.py` (`get_current_user`, `require_admin`).

Uploads served from `backend/uploads/` mounted at `/uploads`. The frontend resolves relative URLs via `lib/api.ts:mediaUrl`.

## Conventions

- All UI text is in Russian. Keep it that way.
- First registered user becomes `admin` (`auth_service.py`). Subsequent users default to `user`.
- Slugs for categories are transliterated from Cyrillic in `services/category_service.py`.
- File uploads validated by extension whitelist in `services/book_service.py`.
- Use `api()` helper from `lib/api.ts` for all fetches — it handles auth headers and 401 redirects.
- Protected pages wrap content in `<Shell required adminOnly?>`.

## Running

Backend: create `backend/.env` with `DATABASE_URL` + `SECRET_KEY`, then `alembic upgrade head && python run.py`.
Frontend: `npm install && npm run dev` in `frontend/`.

## Things to watch

- CORS is hardcoded to `http://localhost:3000` in `app/main.py`.
- `python-jose` + `passlib[bcrypt]` combo requires `bcrypt==4.0.1` pinned (newer bcrypt breaks passlib).
- Alembic env.py imports `app.models` to register metadata — don't remove that import.
- `Book.available` flag is managed by borrow service, not edited directly by users.
