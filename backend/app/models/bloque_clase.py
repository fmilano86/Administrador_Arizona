import enum

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    Column,
    Date,
    Enum,
    ForeignKey,
    Identity,
    Index,
    SmallInteger,
    Time,
    TIMESTAMP,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class FrecuenciaBloque(str, enum.Enum):
    SEMANAL = "SEMANAL"


class EstadoBloque(str, enum.Enum):
    ACTIVO = "ACTIVO"
    FINALIZADO = "FINALIZADO"
    CANCELADO = "CANCELADO"


class BloqueClase(Base):
    __tablename__ = "bloque_clase"
    __table_args__ = (
        CheckConstraint(
            "cupo_maximo > 0",
            name="bloque_clase_cupo_maximo_check",
        ),
        CheckConstraint(
            "fecha_hasta >= fecha_desde",
            name="bloque_clase_check",
        ),
        CheckConstraint(
            "hora_fin > hora_inicio",
            name="bloque_clase_check1",
        ),
        Index("idx_bloque_actividad", "actividad_id"),
        Index("idx_bloque_profesor", "profesor_id"),
    )

    id = Column(BigInteger, Identity(always=True), primary_key=True)
    actividad_id = Column(BigInteger, ForeignKey("actividad.id"), nullable=False)
    profesor_id = Column(BigInteger, ForeignKey("usuario.id"), nullable=False)
    creado_por_id = Column(BigInteger, ForeignKey("usuario.id"), nullable=False)
    fecha_desde = Column(Date, nullable=False)
    fecha_hasta = Column(Date, nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)
    frecuencia = Column(
        Enum(FrecuenciaBloque, name="frecuencia_bloque", create_type=False),
        nullable=False,
        default=FrecuenciaBloque.SEMANAL,
    )
    cupo_maximo = Column(SmallInteger, nullable=False, default=7)
    estado = Column(
        Enum(EstadoBloque, name="estado_bloque", create_type=False),
        nullable=False,
        default=EstadoBloque.ACTIVO,
    )
    fecha_alta = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    eliminado_en = Column(TIMESTAMP(timezone=True))

    actividad = relationship("Actividad")
    profesor = relationship("Usuario", foreign_keys=[profesor_id])
    creado_por = relationship("Usuario", foreign_keys=[creado_por_id])
    clases = relationship("Clase", back_populates="bloque")
