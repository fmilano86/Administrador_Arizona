from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.usuario import RolUsuario
from app.schemas.actividad import ActividadCreate, ActividadOut, ActividadUpdate
from app.services.actividad_service import (
    actualizar_actividad,
    crear_actividad,
    listar_actividades,
    obtener_actividad,
    obtener_actividad_por_nombre,
)

router = APIRouter()


@router.get("", response_model=list[ActividadOut])
def listar(db: Session = Depends(get_db), _usuario=Depends(get_current_user)):
    return listar_actividades(db)


@router.post("", response_model=ActividadOut, status_code=status.HTTP_201_CREATED)
def crear(
    data: ActividadCreate,
    db: Session = Depends(get_db),
    _usuario=Depends(require_roles(RolUsuario.ADMINISTRADOR)),
):
    if obtener_actividad_por_nombre(db, data.nombre):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una actividad con ese nombre",
        )
    return crear_actividad(db, data)


@router.patch("/{actividad_id}", response_model=ActividadOut)
def actualizar(
    actividad_id: int,
    data: ActividadUpdate,
    db: Session = Depends(get_db),
    _usuario=Depends(require_roles(RolUsuario.ADMINISTRADOR)),
):
    actividad = obtener_actividad(db, actividad_id)
    if not actividad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Actividad no encontrada"
        )
    if (
        data.nombre
        and data.nombre != actividad.nombre
        and obtener_actividad_por_nombre(db, data.nombre)
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una actividad con ese nombre",
        )
    return actualizar_actividad(db, actividad, data)