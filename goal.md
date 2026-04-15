# goal.md — LibrarySystem: Full-Stack University Demo Project

> **Read this file first before writing any code.** Follow every requirement exactly as written.

---

## Project Overview

Build a full-stack **Library Management System** as a university final project demo. The system automates library catalog management and book lending for users. The entire UI must be in **Russian language**.

---

## Tech Stack

### Backend
- **Language:** Python 3.11
- **Framework:** FastAPI
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Migrations:** Alembic
- **Auth:** JWT (Bearer tokens)
- **Data format:** JSON
- **API Docs:** Swagger UI at `/docs`

### Frontend
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **UI Library:** React
- **Styling:** Tailwind CSS
- **HTTP Client:** fetch or axios

---

## Language Requirement

**All UI text must be in Russian.** This includes:
- Navigation labels
- Page titles and headings
- Form labels and placeholders
- Button text
- Error messages
- Table column headers
- Status labels (e.g. "Доступна", "Выдана")

---

## Project Structure

```
LibrarySystem/
│
├── backend/
│   └── app/
│       ├── api/
│       │   ├── auth_router.py
│       │   ├── books_router.py
│       │   └── borrow_router.py
│       ├── core/
│       │   ├── config.py
│       │   └── security.py
│       ├── dependencies/
│       │   └── auth_dependencies.py
│       ├── schemas/
│       │   ├── user_schema.py
│       │   ├── book_schema.py
│       │   └── borrow_schema.py
│       ├── repositories/
│       │   ├── user_repository.py
│       │   ├── book_repository.py
│       │   └── borrow_repository.py
│       ├── services/
│       │   ├── auth_service.py
│       │   ├── book_service.py
│       │   └── borrow_service.py
│       ├── models/
│       │   ├── user_model.py
│       │   ├── book_model.py
│       │   └── borrow_model.py
│       ├── db/
│       │   ├── database.py
│       │   └── session.py
│       └── main.py
│   ├── alembic/
│   ├── run.py
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    ├── app/
    │   ├── login/page.tsx
    │   ├── register/page.tsx
    │   ├── books/page.tsx
    │   ├── borrow/page.tsx
    │   └── layout.tsx
    ├── components/
    ├── lib/
    └── package.json
```

---

## Architecture

Backend follows a **layered architecture**:
1. **API layer** — FastAPI routers, request/response handling
2. **Service layer** — business logic
3. **Repository layer** — database queries via SQLAlchemy
4. **Database layer** — PostgreSQL via SQLAlchemy + Alembic migrations

---

## Database Models

### User
| Field | Type | Constraints |
|-------|------|-------------|
| id | int | PK, auto-increment |
| full_name | str(100) | NOT NULL |
| email | str(255) | UNIQUE, NOT NULL |
| password_hash | TEXT | NOT NULL |
| created_at | datetime | auto |

### Book
| Field | Type | Constraints |
|-------|------|-------------|
| id | int | PK, auto-increment |
| title | str | NOT NULL |
| author | str | NOT NULL |
| published_year | int | NOT NULL |
| available | bool | default True |

### Borrow
| Field | Type | Constraints |
|-------|------|-------------|
| id | int | PK, auto-increment |
| user_id | int | FK → User.id |
| book_id | int | FK → Book.id |
| borrow_date | datetime | auto |
| return_date | datetime | nullable |

---

## Backend API Endpoints

### Authentication Module

#### POST /auth/register
Register a new user.

**Request body:**
```json
{
  "full_name": "Ivan Ivanov",
  "email": "user@example.com",
  "password": "password123"
}
```

**Logic:**
- Validate email format
- Check email uniqueness
- Hash password (bcrypt)
- Save user to database

**Response (201):**
```json
{ "id": 1, "full_name": "Ivan Ivanov", "email": "user@example.com" }
```

---

#### POST /auth/login
Authenticate a user and return a JWT token.

**Request body:**
```json
{ "email": "user@example.com", "password": "password123" }
```

**Logic:**
- Find user by email
- Verify password hash
- Create and return JWT access token

**Response (200):**
```json
{ "access_token": "jwt_token_string", "token_type": "bearer" }
```

---

#### GET /auth/me
Get the currently authenticated user's profile.

**Header:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{ "id": 1, "full_name": "Ivan Ivanov", "email": "user@example.com" }
```

---

### Books Module

#### POST /books
Add a new book. Requires authentication.

**Request body:**
```json
{ "title": "Clean Code", "author": "Robert Martin", "published_year": 2008 }
```

**Logic:** Create book, set `available = true`.

---

#### GET /books
Get list of all books.

**Response (200):**
```json
[
  { "id": 1, "title": "Clean Code", "author": "Robert Martin", "published_year": 2008, "available": true }
]
```

---

#### GET /books/{id}
Get a single book by ID.

---

#### PUT /books/{id}
Update a book by ID. Requires authentication.

---

#### DELETE /books/{id}
Delete a book by ID. Requires authentication.

---

### Borrow Module

#### POST /borrow
Issue a book to a user. Requires authentication.

**Request body:**
```json
{ "user_id": 1, "book_id": 5 }
```

**Conditions:**
- User must exist
- Book must be available (`available = true`)

**After issuing:**
- Set book `available = false`
- Record `borrow_date`

---

#### POST /borrow/{id}/return
Return a borrowed book.

**After return:**
- Set book `available = true`
- Record `return_date`

---

#### GET /borrow
Get list of all borrow records (with user and book details).

---

## Error Handling

All endpoints must return proper HTTP error responses in JSON format:

| HTTP Code | Meaning |
|-----------|---------|
| 400 | Bad Request — invalid input |
| 401 | Unauthorized — missing or invalid JWT |
| 404 | Not Found — resource does not exist |
| 500 | Internal Server Error |

---

## Security Requirements

- All passwords must be hashed using bcrypt before storing
- JWT tokens must be used for authentication
- Protected endpoints must be secured via a middleware/dependency that validates the JWT
- Input validation via Pydantic schemas

---

## API Documentation

After running the backend, Swagger UI must be available at:
```
http://localhost:8000/docs
```
Generated automatically by FastAPI.

---

## Frontend Pages & Features

All frontend text must be in **Russian**.

### Pages

#### /login — Страница входа
- Form fields: Email, Пароль
- Button: "Войти"
- Link to register page: "Нет аккаунта? Зарегистрироваться"
- On success: save JWT token to localStorage, redirect to /books
- On error: show Russian error message

#### /register — Страница регистрации
- Form fields: Полное имя, Email, Пароль
- Button: "Зарегистрироваться"
- Link back to login
- On success: redirect to /login

#### /books — Каталог книг (protected)
- Table with columns: ID, Название, Автор, Год издания, Статус (Доступна / Выдана)
- Button "Добавить книгу" — opens a form/modal
- Each row has "Редактировать" and "Удалить" buttons
- Availability status shown as a colored badge (green = Доступна, red = Выдана)

#### /borrow — Выдача книг (protected)
- Table showing all borrow records: ID, Пользователь, Книга, Дата выдачи, Дата возврата
- Button "Выдать книгу" — opens form to select user and book
- "Вернуть" button on rows where `return_date` is null
- After returning, table refreshes

### Navigation
- Top navbar with links: Каталог книг, Выдача книг
- Show current user name from `/auth/me`
- Logout button: "Выйти" — clears token, redirects to /login

### Auth
- Store JWT in localStorage key `access_token`
- All protected API calls must include `Authorization: Bearer <token>` header
- If JWT missing or expired, redirect to /login

---

## Definition of Done

The project is considered complete when:

**Backend:**
- [ ] FastAPI app runs on `localhost:8000`
- [ ] PostgreSQL connected via SQLAlchemy
- [ ] Alembic migrations generate tables correctly
- [ ] Auth module: register, login, /me — all working
- [ ] Books module: full CRUD working
- [ ] Borrow module: issue, return, list — all working
- [ ] JWT protection on all non-public endpoints
- [ ] Proper HTTP error codes returned
- [ ] Swagger UI available at `/docs`

**Frontend:**
- [ ] Next.js app runs on `localhost:3000`
- [ ] All UI text is in Russian
- [ ] Login and register pages work end-to-end
- [ ] Books catalog page shows all books with status
- [ ] Add/edit/delete book works
- [ ] Borrow page shows all records
- [ ] Issue and return book works
- [ ] Navbar with logout works
- [ ] Protected routes redirect to /login if unauthenticated

---

## Running the Project

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Set DATABASE_URL and SECRET_KEY in .env
alembic upgrade head
python run.py
```

### Frontend
```bash
cd frontend
npm install
# Set NEXT_PUBLIC_API_URL=http://localhost:8000 in .env.local
npm run dev
```