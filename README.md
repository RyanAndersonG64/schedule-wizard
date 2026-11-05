# schedule-wizard

A weekly planner: React (Vite + TypeScript) frontend, FastAPI + SQLite backend.

## Running it

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
fastapi dev main.py
```

API docs are at http://localhost:8000/docs. Data is stored in `backend/schedule.db`,
which is created on first start.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Requests to `/api/*` are forwarded to the backend.

## Tests

```powershell
cd backend; .\.venv\Scripts\python -m pytest     # API and validation
cd frontend; npm test                              # date math, event layout, form validation
```

## Project layout

```
backend/
  main.py            app setup; creates tables on startup
  database.py        SQLite engine and per-request sessions (get_db)
  models.py          SQLAlchemy tables (how data is stored)
  schemas.py         Pydantic schemas (what the API accepts/returns) and UTC conversion
  routers/events.py  POST /api/events, GET /api/events?start=&end=
  tests/

frontend/src/
  App.tsx            selected week, loading/error/empty messages, form toggle
  api/events.ts      the only code that calls fetch
  hooks/             useWeekEvents: loads a week's events
  components/        WeekNav, Schedule (grid), DayColumn, EventBlock, EventForm
  utils/             dates, event positioning, form validation (+ tests)
  types.ts           CalendarEvent / NewEvent
```

## Notes

- **Times** are stored in UTC and shown in the browser's local time. The API requires
  a timezone offset on incoming times (e.g. `2026-11-04T09:00:00-05:00` or `...Z`).
- **Schema changes:** tables are created with `create_all()`, which doesn't alter
  existing tables. After changing `models.py`, delete `backend/schedule.db` (dev only)
  or set up Alembic for migrations.
