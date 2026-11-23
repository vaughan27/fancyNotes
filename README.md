# Notes app

FastAPI (uv) + PostgreSQL backend, React (Vite) frontend.

## 1. Database

```bash
createdb notes
```

The API defaults to `postgresql+psycopg://postgres:postgres@localhost:5432/notes`.
Override with `DATABASE_URL`. The table is created automatically on startup.

## 2. Backend (http://localhost:8000, docs at /docs)

```bash
cd backend
uv sync
uv run fastapi dev app/main.py
```

## 3. Frontend (http://localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

Vite proxies `/api` to the backend.
