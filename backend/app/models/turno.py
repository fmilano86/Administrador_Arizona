import enum

from sqlalchemy import BigInteger, Column, Enum, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class TipoTurno(str, enum.Enum):
    PUNTUAL = "PUNTUAL"
    RECURRENTE = "RECURRENTE"


class EstadoTurno(str, enum.Enum):
    CONFIRMADO = "CONFIRMADO"
    CANCELADO = "CANCELADO"


class Turno(Base):
    __tablename__ = "turno"

    id = Column(BigInteger, primary_key=True)
    alumno_id = Column(BigInteger, ForeignKey("usuario.id"), nullable=False)
    clase_id = Column(BigInteger, ForeignKey("clase.id"), nullable=False)
    tipo = Column(Enum(TipoTurno, name="tipo_turno", create_type=False), nullable=False)
    estado = Column(Enum(EstadoTurno, name="estado_turno", create_type=False), nullable=False, default=EstadoTurno.CONFIRMADO)
    fecha_reserva = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    fecha_cancelacion = Column(TIMESTAMP(timezone=True))
    actualizado_en = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    alumno = relationship("Usuario")
    clase = relationship("Clase", back_populates="turnos")