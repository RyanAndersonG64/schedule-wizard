"""Database setup: the SQLite engine, session factory, and FastAPI dependency."""

from collections.abc import Iterator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

# Keep the database file next to this module, regardless of where the server is started from
DATABASE_URL = f"sqlite:///{Path(__file__).parent / 'schedule.db'}"

# check_same_thread=False: FastAPI runs sync routes in a thread pool, so a connection
# may be used by a different thread than the one that opened it. Each request still
# gets its own session, so this is safe.
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    """Parent class for all SQLAlchemy models; it tracks every table they define."""


def get_db() -> Iterator[Session]:
    """Give a route one database session for the length of its request, then close it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
