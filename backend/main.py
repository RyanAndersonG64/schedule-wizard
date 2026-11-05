from fastapi import FastAPI
from pydantic import BaseModel
from models import Event

app = FastAPI(title="Schedule Wizard API")


@app.get("/api/hello")
def hello() -> dict[str, str]:
    return {"message": "Hello from the FastAPI backend!"}

# Event CRUD

@app.post("/api/events/")
async def create_event(event: Event):
    return {"Event created: " + event.name}