"""Pydantic schemas: the shape of data the API accepts and returns."""

from datetime import datetime, timezone
from typing import Annotated

from pydantic import (
    AfterValidator,
    BaseModel,
    ConfigDict,
    Field,
    PlainSerializer,
    model_validator,
)


# --- Timezone handling -------------------------------------------------------
# This is the one place where times are converted. Incoming times must include a
# timezone offset (e.g. "2026-11-04T09:00:00-05:00") and are converted to UTC.
# The database stores them without timezone info, and outgoing times are marked as
# UTC again ("...Z") so the browser can convert them to the user's local time.


def _to_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        raise ValueError("must include a timezone offset, e.g. 2026-11-04T09:00:00-05:00")
    return value.astimezone(timezone.utc)


def _as_utc_string(value: datetime) -> str:
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


# A datetime from the client: converted to UTC on the way in
AwareDatetime = Annotated[datetime, AfterValidator(_to_utc)]

# A datetime read from the database: marked as UTC on the way out
UtcDatetime = Annotated[datetime, PlainSerializer(_as_utc_string, return_type=str)]


# --- Events --------------------------------------------------------------------


class EventCreate(BaseModel):
    """What the client sends to create an event."""

    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)
    start_time: AwareDatetime
    end_time: AwareDatetime

    @model_validator(mode="after")
    def check_times(self) -> "EventCreate":
        self.title = self.title.strip()
        if not self.title:
            raise ValueError("title must not be blank")
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class EventRead(BaseModel):
    """What the API returns for an event."""

    # Lets Pydantic read attributes straight off a SQLAlchemy object
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    start_time: UtcDatetime
    end_time: UtcDatetime
