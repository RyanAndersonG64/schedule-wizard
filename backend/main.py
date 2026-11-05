from contextlib import asynccontextmanager

from fastapi import FastAPI

from database import Base, engine
from routers import events


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create any tables that don't exist yet. This won't change existing tables;
    # schema changes will need a migration tool such as Alembic (see README).
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Schedule Wizard API", lifespan=lifespan)
app.include_router(events.router)


@app.get("/api/hello")
def hello() -> dict[str, str]:
    return {"message": "Hello from the FastAPI backend!"}
