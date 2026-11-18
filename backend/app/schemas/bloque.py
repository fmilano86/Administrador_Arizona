from datetime import date, datetime, time
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_serializer, model_validator

from app.models.bloque_clase import EstadoBloque, FrecuenciaBloque


class BloqueOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    actividad_id: int
    profesor_id: int
    creado_por_id: int
    fecha_desde: date
    fecha_hasta: date
    hora_inicio: time
    hora_fin: time
    frecuencia: FrecuenciaBloque
    cupo_maximo: int
    estado: EstadoBloque
    fecha_alta: datetime
    actualizado_en: datetime
    eliminado_en: Optional[datetime] = None

    @field_serializer("hora_inicio", "hora_fin")
    def _formatear_hora(self, valor: time) -> str:
        return valor.strftime("%H:%M")


class BloqueCreate(BaseModel):
    actividad_id: int
    profesor_id: int
    fecha_desde: date
    fecha_hasta: date
    hora_inicio: time
    hora_fin: time
    cupo_maximo: int = Field(gt=0)

    @model_validator(mode="after")
    def _validar_rangos(self) -> "BloqueCreate":
        if self.fecha_hasta < self.fecha_desde:
            raise ValueError("fecha_hasta no puede ser anterior a fecha_desde")
        if self.hora_fin <= self.hora_inicio:
            raise ValueError("hora_fin debe ser posterior a hora_inicio")
        return self


class BloqueCreado(BaseModel):
    bloque: BloqueOut
    clases_generadas: int