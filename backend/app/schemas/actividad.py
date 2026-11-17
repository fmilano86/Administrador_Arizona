from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ActividadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    descripcion: Optional[str] = None
    fecha_alta: datetime
    actualizado_en: datetime
    eliminado_en: Optional[datetime] = None


class ActividadCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None


class ActividadUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    eliminado_en: Optional[datetime] = None