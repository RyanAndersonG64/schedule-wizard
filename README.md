# schedule-wizard

React (Vite + TypeScript) frontend with a Python (FastAPI) backend.

```
frontend/   React app (Vite dev server on :5173, proxies /api to the backend)
backend/    FastAPI app (uvicorn on :8000)
```

## Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
fastapi dev main.py
```

API docs are at http://localhost:8000/docs.

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Requests to `/api/*` are forwarded to the backend.
