# Библиотека — Library Management System

Full-stack учебный проект: электронная библиотека с каталогом книг, PDF-читалкой, категориями и системой выдач. Вдохновлён интерфейсом mybook.ru, но сделан минималистичнее.

Весь интерфейс на русском языке.

## Стек

**Backend:** Python 3.11, FastAPI, SQLAlchemy 2, Alembic, PostgreSQL, JWT (bcrypt).
**Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS.

## Возможности

- Регистрация и вход (JWT). Первый зарегистрированный пользователь становится администратором.
- Каталог книг с поиском, фильтрацией по категориям, обложками.
- Подробная страница книги с описанием и кнопкой «Читать».
- PDF-читалка прямо в браузере (`iframe`).
- Админка: CRUD книг и категорий, загрузка PDF и обложек.
- Выдача и возврат книг, журнал выдач.

## Запуск

### Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
source venv/bin/activate
pip install -r requirements.txt

# настройте DATABASE_URL и SECRET_KEY в backend/.env
alembic upgrade head
python run.py
```

API: <http://localhost:8000>, Swagger UI: <http://localhost:8000/docs>.

### Frontend

```bash
cd frontend
npm install
# NEXT_PUBLIC_API_URL=http://localhost:8000 уже в .env.local
npm run dev
```

UI: <http://localhost:3000>.

## Структура

```
backend/
  app/
    api/            # FastAPI роутеры
    core/           # конфиг, security (JWT, bcrypt)
    db/             # engine, session, Base
    dependencies/   # current_user, require_admin
    models/         # SQLAlchemy модели
    repositories/   # доступ к БД
    schemas/        # Pydantic схемы
    services/       # бизнес-логика
    main.py
  alembic/          # миграции
  uploads/          # PDF и обложки (создаётся на старте)

frontend/
  app/              # страницы (App Router)
  components/       # Navbar, Shell, BookCard
  lib/              # api клиент, auth хуки
```

## Роли

- `admin` — полный доступ, добавление книг и категорий, загрузка PDF, выдача книг любому читателю.
- `user` — просмотр каталога, чтение, выдача книг себе, возврат.

Первый пользователь, зарегистрированный в системе, автоматически получает роль `admin`.
