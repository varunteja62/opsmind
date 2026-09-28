import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

logger = logging.getLogger("opsmind.database")

Base = declarative_base()

def get_engine():
    db_url = settings.DATABASE_URL
    # Handle postgresql dialect variations
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    try:
        if db_url.startswith("sqlite"):
            engine = create_engine(
                db_url,
                connect_args={"check_same_thread": False}
            )
        else:
            engine = create_engine(
                db_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20
            )
        # Test connection
        with engine.connect() as conn:
            pass
        return engine
    except Exception as e:
        logger.warning(f"Could not connect to {db_url}: {e}. Falling back to SQLite.")
        sqlite_engine = create_engine(
            "sqlite:///./opsmind.db",
            connect_args={"check_same_thread": False}
        )
        return sqlite_engine

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
