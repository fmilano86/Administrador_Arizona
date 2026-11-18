from fastapi import FastAPI, HTTPException, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.db.session import engine
from app.core.config import settings
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.actividades import router as actividades_router
from app.api.usuarios import router as usuarios_router
from app.api.bloques import router as bloques_router
from app.api.clases import router as clases_router
from app.api.turnos import router as turnos_router

app = FastAPI(
    title="Administrador Arizona API",
    version="0.1.0",
)

origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(actividades_router, prefix="/actividades", tags=["actividades"])
app.include_router(usuarios_router, prefix="/usuarios", tags=["usuarios"])
app.include_router(bloques_router, prefix="/bloques", tags=["bloques"])
app.include_router(clases_router, prefix="/clases", tags=["clases"])
app.include_router(turnos_router, prefix="/turnos", tags=["turnos"])

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/database")
def database_health() -> dict[str, str]:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "ok",
            "database": "connected",
        }
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No se pudo conectar con la base de datos",
        ) from exc
