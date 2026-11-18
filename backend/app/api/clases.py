from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.clase import EstadoClase
from app.models.usuario import RolUsuario, Usuario
from app.schemas.clase import ClaseDetalleOut
from app.services.clase_service import (
    cancelar_clase,
    construir_detalle,
    listar_clases,
    obtener_clase,
)

router = APIRouter()


@router.get("", response_model=list[ClaseDetalleOut])
def listar(
    desde: date | None = None,
    hasta: date | None = None,
    actividad_id: int | None = None,
    profesor_id: int | None = None,
    estado: EstadoClase | None = None,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    clases = listar_clases(
        db, usuario_actual, desde, hasta, actividad_id, profesor_id, estado
    )
    return [construir_detalle(db, c, usuario_actual) for c in clases]


@router.get("/{clase_id}", response_model=ClaseDetalleOut)
def detalle(
    clase_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    clase = obtener_clase(db, clase_id)
    if not clase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Clase no encontrada"
        )
    if (
        usuario_actual.rol == RolUsuario.PROFESOR
        and clase.profesor_id != usuario_actual.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tenés permisos para esta acción",
        )
    return construir_detalle(db, clase, usuario_actual)


@router.patch("/{clase_id}/cancelar", response_model=ClaseDetalleOut)
def cancelar(
    clase_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_roles(RolUsuario.ADMINISTRADOR)),
):
    clase = obtener_clase(db, clase_id)
    if not clase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Clase no encontrada"
        )
    if clase.estado != EstadoClase.PROGRAMADA:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="La clase ya está cancelada"
        )
    clase = cancelar_clase(db, clase)
    return construir_detalle(db, clase, usuario_actual)