import enum

from sqlalchemy import BigInteger, Column, Enum, ForeignKey, SmallInteger, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class EstadoClase(str, enum.Enum):
    PROGRAMADA = "PROGRAMADA"
    CANCELADA = "CANCELADA"
    FINALIZADA = "FINALIZADA"


class Clase(Base):
    __tablename__ = "clase"

    id = Column(BigInteger, primary_key=True)
    bloque_clase_id = Column(BigInteger, ForeignKey("bloque_clase.id"))
    actividad_id = Column(BigInteger, ForeignKey("actividad.id"), nullable=False)
    profesor_id = Column(BigInteger, ForeignKey("usuario.id"), nullable=False)
    inicio = Column(TIMESTAMP(timezone=True), nullable=False)
    fin = Column(TIMESTAMP(timezone=True), nullable=False)
    cupo_maximo = Column(SmallInteger, nullable=False, default=7)
    estado = Column(Enum(EstadoClase, name="estado_clase", create_type=False), nullable=False, default=EstadoClase.PROGRAMADA)
    fecha_alta = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    eliminado_en = Column(TIMESTAMP(timezone=True))

    bloque = relationship("BloqueClase", back_populates="clases")
    actividad = relationship("Actividad")
    profesor = relationship("Usuario")
    turnos = relationship("Turno", back_populates="clase")