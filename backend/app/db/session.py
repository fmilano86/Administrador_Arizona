from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Esto arma la conexión real a Postgres usando la DATABASE_URL del .env, y define get_db(), que cada endpoint de FastAPI va a usar para pedir una sesión de base de datos (y que se cierra sola al terminar el request).