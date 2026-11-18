from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.usuario import RolUsuario


class UsuarioCreate(BaseModel):
    rol: RolUsuario
    nombre: str
    apellido: str
    email: EmailStr
    telefono: Optional[str] = None
    dni: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    password: str


class UsuarioUpdate(BaseModel):
    rol: Optional[RolUsuario] = None
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    dni: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    password: Optional[str] = None
    eliminado_en: Optional[str] = None


class UsuarioResumenOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    apellido: str
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    fecha_nacimiento: Optional[date] = None


class CumpleanioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    apellido: str
    rol: RolUsuario
    fecha_nacimiento: date
    dias_restantes: int
    cumple_hoy: bool