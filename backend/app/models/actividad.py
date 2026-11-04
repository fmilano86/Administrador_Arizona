from sqlalchemy import BigInteger, Column, String, TEXT, TIMESTAMP
from sqlalchemy.sql import func

from app.db.base import Base


class Actividad(Base):
    __tablename__ = "actividad"

    id = Column(BigInteger, primary_key=True)
    nombre = Column(String(100), nullable=False, unique=True)
    descripcion = Column(TEXT)
    fecha_alta = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    eliminado_en = Column(TIMESTAMP(timezone=True))