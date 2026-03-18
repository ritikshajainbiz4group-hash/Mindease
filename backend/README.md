# MindEase — FastAPI Backend

AI Mental Health REST API built with FastAPI, SQLAlchemy, and JWT authentication.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI 0.111 |
| ORM | SQLAlchemy 2 |
| Migrations | Alembic |
| Validation | Pydantic v2 |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Database | PostgreSQL |
| Storage | AWS S3 (boto3) |

## Project Structure

```
backend/
├── app/
│   ├── core/
│   │   ├── auth/           # JWT handler + auth dependency
│   │   ├── aws/            # S3 service
│   │   ├── config/         # Pydantic settings (env-based)
│   │   ├── schemas/        # Shared base Pydantic models
│   │   ├── services/       # Email service
│   │   ├── utils/          # Password hashing, helpers
│   │   └── database.py     # SQLAlchemy engine + session
│   ├── features/
│   │   ├── auth/           # Register, login, refresh, me
│   │   └── category/       # CRUD categories
│   ├── models/             # SQLAlchemy ORM models
│   └── main.py             # FastAPI app + CORS + routers
├── requirements.txt
└── .env.example
```

## Getting Started

### 1. Set up environment

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env and set DATABASE_URL, SECRET_KEY, etc.
```

### 3. Run database migrations

```bash
alembic upgrade head
```

### 4. Start the server

```bash
uvicorn app.main:app --reload
```

API docs available at: http://localhost:8000/docs

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | Login, get tokens |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `GET` | `/api/v1/auth/me` | Get current user |
| `POST` | `/api/v1/auth/logout` | Logout |
| `GET` | `/api/v1/categories` | List user categories |
| `POST` | `/api/v1/categories` | Create category |
| `GET` | `/api/v1/categories/{id}` | Get category |
| `PATCH` | `/api/v1/categories/{id}` | Update category |
| `DELETE` | `/api/v1/categories/{id}` | Delete category |
| `GET` | `/health` | Health check |
