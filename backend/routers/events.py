"""Endpoints for creating, retrieving and deleting calendar events."""

from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models import Event
from schemas import AwareDatetime, EventCreate, EventRead

router = APIRouter(prefix="/api/events", tags=["events"])

DbSession = Annotated[Session, Depends(get_db)]


def _for_db(value: datetime) -> datetime:
    """SQLite can't store timezones, so drop the (already UTC) offset before saving."""
    return value.replace(tzinfo=None)


@router.post("", response_model=EventRead, status_code=status.HTTP_201_CREATED)
def create_event(data: EventCreate, db: DbSession) -> Event:
    event = Event(
        title=data.title,
        description=data.description,
        start_time=_for_db(data.start_time),
        end_time=_for_db(data.end_time),
    )
    db.add(event)
    db.commit()
    db.refresh(event)  # load the id the database assigned
    return event


@router.get("", response_model=list[EventRead])
def list_events(
    db: DbSession,
    start: Annotated[AwareDatetime, Query(description="Start of the range (inclusive)")],
    end: Annotated[AwareDatetime, Query(description="End of the range (exclusive)")],
) -> list[Event]:
    """Return every event that overlaps the range, even partly."""
    if end <= start:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "end must be after start")

    # Two ranges overlap when each one starts before the other ends
    query = (
        select(Event)
        .where(Event.start_time < _for_db(end), Event.end_time > _for_db(start))
        .order_by(Event.start_time)
    )
    return list(db.scalars(query))


@router.put("/{event_id}", response_model=EventRead)
def update_event(
    db: DbSession,
    event_id: int,
    data: EventCreate
    ) -> Event:
    event = db.get(Event, event_id)
    if event is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Event not found")
    event.title = data.title
    event.description = data.description
    event.start_time = _for_db(data.start_time)
    event.end_time = _for_db(data.end_time)
    db.commit()
    db.refresh(event)
    return event
    


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: int, db: DbSession) -> None:
    # db.get() looks a row up by primary key, or returns None if there isn't one
    event = db.get(Event, event_id)
    if event is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Event not found")
    db.delete(event)
    db.commit()

