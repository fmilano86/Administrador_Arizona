import os
import sys
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL")

if not TEST_DATABASE_URL:
    pytest.exit(
        "Falta TEST_DATABASE_URL. Corre los tests asi (ajustando usuario/driver):\n"
        '  TEST_DATABASE_URL="postgresql+psycopg2://TU_USUARIO@localhost:5432/arizona_test" pytest\n'
        "Ver la seccion Tests de backend/README.md."
    )

if "test" not in TEST_DATABASE_URL:
    pytest.exit(
        "TEST_DATABASE_URL no parece apuntar a una base de prueba "
        "(no contiene 'test' en el nombre). Se aborta para no tocar datos reales."
    )

test_engine = create_engine(TEST_DATABASE_URL)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

TZ_ESTUDIO = ZoneInfo("America/Argentina/Buenos_Aires")


@pytest.fixture
def db_session():
    """Cada test corre dentro de una transaccion que se revierte al final:
    los tests no se pisan entre si ni dejan datos en la base de prueba."""
    connection = test_engine.connect()
    outer_transaction = connection.begin()
    session = TestSessionLocal(
        bind=connection, join_transaction_mode="create_savepoint"
    )

    yield session

    session.close()
    outer_transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    from app.db.session import get_db
    from app.main import app

    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def crear_usuario(db_session, rol="ALUMNO", email=None, password="Prueba1234", **extra):
    from app.core.security import hash_password
    from app.models.usuario import Usuario

    sufijo = uuid.uuid4().hex[:8]
    usuario = Usuario(
        rol=rol,
        nombre=extra.pop("nombre", "Test"),
        apellido=extra.pop("apellido", "Usuario"),
        email=email or f"test.{sufijo}@arizonaqa.com",
        password_hash=hash_password(password),
        **extra,
    )
    db_session.add(usuario)
    db_session.flush()
    return usuario


def headers_para(usuario):
    from app.core.security import create_access_token

    rol = usuario.rol.value if hasattr(usuario.rol, "value") else usuario.rol
    token = create_access_token(subject=str(usuario.id), rol=rol)
    return {"Authorization": f"Bearer {token}"}


def crear_actividad(db_session, nombre="Pilates"):
    from app.models.actividad import Actividad

    actividad = Actividad(nombre=nombre)
    db_session.add(actividad)
    db_session.flush()
    return actividad


def crear_clase(
    db_session,
    actividad,
    profesor,
    cupo_maximo=1,
    en_minutos=60,
    duracion_minutos=60,
):
    from app.models.clase import Clase

    inicio = datetime.now(tz=TZ_ESTUDIO) + timedelta(minutes=en_minutos)
    clase = Clase(
        actividad_id=actividad.id,
        profesor_id=profesor.id,
        inicio=inicio,
        fin=inicio + timedelta(minutes=duracion_minutos),
        cupo_maximo=cupo_maximo,
    )
    db_session.add(clase)
    db_session.flush()
    return clase
