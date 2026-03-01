from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Using your exact credentials: user=postgres, pass=postgresql, db=tbadb
DATABASE_URL = "postgresql://postgres:postgresql@127.0.0.1:5435/tbadb"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()