import enum

from sqlalchemy import BigInteger, Column, Date, Enum, String, TIMESTAMP
from sqlalchemy.sql import func

from app.db.base import Base


class RolUsuario(str, enum.Enum):
    ALUMNO = "ALUMNO"
    PROFESOR = "PROFESOR"
    ADMINISTRADOR = "ADMINISTRADOR"


class Usuario(Base):
    __tablename__ = "usuario"

    id = Column(BigInteger, primary_key=True)
    rol = Column(Enum(RolUsuario, name="rol_usuario", create_type=False), nullable=False)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    telefono = Column(String(30))
    dni = Column(String(20), unique=True)
    fecha_nacimiento = Column(Date)
    fecha_alta = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    eliminado_en = Column(TIMESTAMP(timezone=True))