"""Validation rules for incoming events."""

from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from schemas import EventCreate


def make(**overrides):
    data = {
        "title": "Coding",
        "start_time": "2026-11-04T09:00:00-05:00",
        "end_time": "2026-11-04T10:00:00-05:00",
    }
    data.update(overrides)
    return EventCreate(**data)


def test_valid_event_is_converted_to_utc():
    event = make()
    assert event.start_time == datetime(2026, 11, 4, 14, 0, tzinfo=timezone.utc)
    assert event.end_time == datetime(2026, 11, 4, 15, 0, tzinfo=timezone.utc)
    assert event.description == ""


def test_title_is_trimmed():
    assert make(title="  Coding  ").title == "Coding"


@pytest.mark.parametrize("title", ["", "   "])
def test_blank_title_is_rejected(title):
    with pytest.raises(ValidationError):
        make(title=title)


def test_overlong_title_is_rejected():
    with pytest.raises(ValidationError):
        make(title="x" * 201)


def test_end_before_start_is_rejected():
    with pytest.raises(ValidationError, match="end_time must be after start_time"):
        make(end_time="2026-11-04T08:00:00-05:00")


def test_zero_length_event_is_rejected():
    with pytest.raises(ValidationError):
        make(end_time="2026-11-04T09:00:00-05:00")


def test_time_without_timezone_is_rejected():
    with pytest.raises(ValidationError, match="timezone offset"):
        make(start_time="2026-11-04T09:00:00")


def test_event_crossing_midnight_is_allowed():
    event = make(start_time="2026-11-04T22:00:00-05:00", end_time="2026-11-05T01:00:00-05:00")
    assert event.end_time > event.start_time
