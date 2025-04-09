# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Use SQLite (local), switch to Postgres/MySQL URI in prod if needed
SQLALCHEMY_DATABASE_URL = "sqlite:///./task_data.db"

# Create engine with check_same_thread=False for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create session local factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
