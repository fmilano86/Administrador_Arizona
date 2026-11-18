from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.clase import EstadoClase
from app.schemas.actividad import ActividadResumenOut
from app.schemas.turno import TurnoOut
from app.schemas.usuario import UsuarioResumenOut


class ClaseDetalleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    bloque_clase_id: Optional[int] = None
    actividad_id: int
    profesor_id: int
    inicio: datetime
    fin: datetime
    cupo_maximo: int
    estado: EstadoClase
    fecha_alta: datetime
    actualizado_en: datetime
    eliminado_en: Optional[datetime] = None
    actividad: ActividadResumenOut
    profesor: UsuarioResumenOut
    turnos_confirmados: int
    cupos_disponibles: int
    en_espera: int
    mi_turno: Optional[TurnoOut] = None