from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.usuario import RolUsuario
from app.schemas.auth import UsuarioOut
from app.schemas.usuario import CumpleanioOut, UsuarioCreate, UsuarioUpdate
from app.services.usuario_service import (
    actualizar_usuario,
    crear_usuario,
    listar_cumpleanios,
    listar_usuarios,
    obtener_usuario,
    obtener_usuario_por_dni,
    obtener_usuario_por_email,
)

router = APIRouter()


@router.get("", response_model=list[UsuarioOut])
def listar(
    rol: RolUsuario = Query(...),
    db: Session = Depends(get_db),
    _usuario=Depends(require_roles(RolUsuario.ADMINISTRADOR)),
):
    return listar_usuarios(db, rol)


@router.get("/cumpleanios", response_model=list[CumpleanioOut])
def cumpleanios(
    dias: int = Query(7, ge=0, le=365),
    rol: RolUsuario | None = Query(default=None),
    db: Session = Depends(get_db),
    _usuario=Depends(require_roles(RolUsuario.ADMINISTRADOR)),
):
    return listar_cumpleanios(db, dias=dias, rol=rol)


@router.post("", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def crear(
    data: UsuarioCreate,
    db: Session = Depends(get_db),
    _usuario=Depends(require_roles(RolUsuario.ADMINISTRADOR)),
):
    if obtener_usuario_por_email(db, data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un usuario con ese email",
        )
    if data.dni and obtener_usuario_por_dni(db, data.dni):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un usuario con ese DNI",
        )
    return crear_usuario(db, data)


@router.patch("/{usuario_id}", response_model=UsuarioOut)
def actualizar(
    usuario_id: int,
    data: UsuarioUpdate,
    db: Session = Depends(get_db),
    _usuario=Depends(require_roles(RolUsuario.ADMINISTRADOR)),
):
    usuario = obtener_usuario(db, usuario_id)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )
    if (
        data.email
        and data.email != usuario.email
        and obtener_usuario_por_email(db, data.email)
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un usuario con ese email",
        )
    if (
        data.dni
        and data.dni != usuario.dni
        and obtener_usuario_por_dni(db, data.dni)
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un usuario con ese DNI",
        )
    return actualizar_usuario(db, usuario, data)