import enum

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    Column,
    Enum,
    ForeignKey,
    Identity,
    Index,
    SmallInteger,
    TIMESTAMP,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class EstadoClase(str, enum.Enum):
    PROGRAMADA = "PROGRAMADA"
    CANCELADA = "CANCELADA"
    FINALIZADA = "FINALIZADA"


class Clase(Base):
    __tablename__ = "clase"
    __table_args__ = (
        CheckConstraint(
            "cupo_maximo > 0",
            name="clase_cupo_maximo_check",
        ),
        CheckConstraint(
            "fin > inicio",
            name="clase_check",
        ),
        Index("idx_clase_bloque", "bloque_clase_id"),
        Index("idx_clase_inicio", "inicio"),
        Index("idx_clase_actividad_inicio", "actividad_id", "inicio"),
        Index("idx_clase_profesor_inicio", "profesor_id", "inicio"),
    )

    id = Column(BigInteger, Identity(always=True), primary_key=True)
    bloque_clase_id = Column(BigInteger, ForeignKey("bloque_clase.id"))
    actividad_id = Column(BigInteger, ForeignKey("actividad.id"), nullable=False)
    profesor_id = Column(BigInteger, ForeignKey("usuario.id"), nullable=False)
    inicio = Column(TIMESTAMP(timezone=True), nullable=False)
    fin = Column(TIMESTAMP(timezone=True), nullable=False)
    cupo_maximo = Column(SmallInteger, nullable=False, default=7)
    estado = Column(
        Enum(EstadoClase, name="estado_clase", create_type=False),
        nullable=False,
        default=EstadoClase.PROGRAMADA,
    )
    fecha_alta = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    eliminado_en = Column(TIMESTAMP(timezone=True))

    bloque = relationship("BloqueClase", back_populates="clases")
    actividad = relationship("Actividad")
    profesor = relationship("Usuario")
    turnos = relationship("Turno", back_populates="clase")
