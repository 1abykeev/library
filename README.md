# Библиотека — Library Management System

Full-stack учебный проект: электронная библиотека с каталогом книг, PDF-читалкой, категориями, системой выдач и отзывами. Вдохновлён интерфейсом mybook.ru, но сделан минималистичнее.

Весь интерфейс на русском языке.

## Стек

**Backend:** Python 3.11+, FastAPI, SQLAlchemy 2, Alembic, PostgreSQL, JWT (bcrypt).
**Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS.

## Возможности

### Публичная часть
- Лендинг, страницы «О нас», «Контакты», «Вопросы».
- Публичный каталог с поиском и фильтрацией по категориям.
- Подробная страница книги с рейтингом, отзывами и PDF-читалкой.
- Раздел «Бесплатные книги» — защищённая системная категория, которую нельзя удалить или переименовать.
- Онлайн-чтение PDF и скачивание бесплатных книг без регистрации.

### Админ-панель
- Один администратор на систему: публичная регистрация закрывается после создания первого пользователя.
- Дашборд `/admin`: ключевые метрики (книги, активные выдачи, средний рейтинг), топ-5 книг по выдачам, история клиентов с поиском и фильтром (все / на руках / возвращённые).
- CRUD книг и категорий, загрузка PDF и обложек.
- Выдача книги гостю: администратор вводит имя, фамилию, телефон, email, паспорт и заметку. Клиенты в системе не регистрируются.
- Возврат с оценкой: при возврате админ вводит рейтинг (1–5 звёзд) и текст отзыва со слов клиента. Средний рейтинг и отзывы показываются публично.

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

Первый вход: откройте <http://localhost:3000/register> и создайте администратора. После этого регистрация закрывается — публичные страницы ведут только на `/login`.

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
    api/            # FastAPI роутеры (auth, books, categories, borrow, stats)
    core/           # конфиг, security (JWT, bcrypt)
    db/             # engine, session, Base
    dependencies/   # current_user, require_admin
    models/         # SQLAlchemy модели
    repositories/   # доступ к БД
    schemas/        # Pydantic схемы
    services/       # бизнес-логика
    main.py
  alembic/          # миграции (0001 схема, 0002 seed free-books, 0003 borrower info, 0004 rating)
  uploads/          # PDF и обложки (создаётся на старте)

frontend/
  app/              # страницы (App Router): /, /catalog, /free, /about, /contacts, /faq,
                    # /login, /admin, /books, /borrow, /categories
  components/       # Navbar, PublicNavbar, Footer, Shell, PublicShell, BookCard, Stars
  lib/              # api клиент, auth хелперы
```

## Роли

- `admin` — единственный авторизованный пользователь. Полный доступ, ведёт выдачи, ставит оценки, управляет каталогом.
- Клиенты — не регистрируются. Админ оформляет на них выдачи; бесплатные книги доступны всем без аккаунта.

Первый пользователь, зарегистрированный через `/register`, автоматически получает роль `admin`. Дальнейшая регистрация запрещена на уровне API.
