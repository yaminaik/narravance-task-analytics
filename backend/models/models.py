# models/models.py
from sqlalchemy import Column, Integer, String, DateTime, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
from database import engine

Base = declarative_base()

class Task(Base):
    __tablename__ = 'tasks'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    status = Column(String, default='pending')
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    companies = Column(JSON, default=[])

    records = relationship("Record", back_populates="task", cascade="all, delete-orphan")

class Record(Base):
    __tablename__ = 'records'

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    company = Column(String)
    model = Column(String)
    price = Column(Float)
    date = Column(DateTime)
    color = Column(String)
    source = Column(String)

    task = relationship("Task", back_populates="records")

class CarCompany(Base):
    __tablename__ = 'car_companies'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

# Create tables
Base.metadata.create_all(bind=engine)
