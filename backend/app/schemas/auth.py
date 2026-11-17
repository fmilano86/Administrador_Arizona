from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.usuario import RolUsuario


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    rol: RolUsuario
    nombre: str
    apellido: str
    email: EmailStr
    telefono: Optional[str] = None
    dni: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    fecha_alta: datetime
    actualizado_en: datetime
    eliminado_en: Optional[datetime] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    password: str
    telefono: Optional[str] = None
    fecha_nacimiento: Optional[date] = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioOut