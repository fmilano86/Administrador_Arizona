from datetime import date
from typing import Optional

from pydantic import BaseModel, EmailStr

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