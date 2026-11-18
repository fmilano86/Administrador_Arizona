from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.turno import EstadoTurno, TipoTurno


class TurnoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    alumno_id: int
    clase_id: int
    tipo: TipoTurno
    estado: EstadoTurno
    fecha_reserva: datetime
    fecha_cancelacion: Optional[datetime] = None
    actualizado_en: datetime

class TurnoCreate(BaseModel):
    clase_id: int