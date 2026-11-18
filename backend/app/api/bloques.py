from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.bloque_clase import EstadoBloque
from app.models.usuario import RolUsuario, Usuario
from app.schemas.bloque import BloqueCreado, BloqueCreate, BloqueOut
from app.services.bloque_service import (
    cancelar_bloque,
    crear_bloque,
    listar_bloques,
    obtener_bloque,
)

router = APIRouter()


@router.get("", response_model=list[BloqueOut])
def listar(
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(require_roles(RolUsuario.ADMINISTRADOR)),
):
    return listar_bloques(db)


@router.post("", response_model=BloqueCreado, status_code=status.HTTP_201_CREATED)
def crear(
    data: BloqueCreate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_roles(RolUsuario.ADMINISTRADOR)),
):
    bloque, cantidad = crear_bloque(db, data, usuario_actual)
    return BloqueCreado(bloque=bloque, clases_generadas=cantidad)


@router.patch("/{bloque_id}/cancelar", response_model=BloqueOut)
def cancelar(
    bloque_id: int,
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(require_roles(RolUsuario.ADMINISTRADOR)),
):
    bloque = obtener_bloque(db, bloque_id)
    if not bloque:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Bloque no encontrado"
        )
    if bloque.estado != EstadoBloque.ACTIVO:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El bloque ya está cancelado o finalizado",
        )
    return cancelar_bloque(db, bloque)