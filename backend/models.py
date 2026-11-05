from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Event(BaseModel):
    name: str
    description: str
    starting_time: int
    ending_time: int

