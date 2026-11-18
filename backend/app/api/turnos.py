from datetime import date, datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.turno import EstadoTurno
from app.models.usuario import RolUsuario, Usuario
from app.schemas.turno import TurnoCreate
from app.schemas.turno_detalle import TurnoDetalleOut
from app.services.turno_service import (
    cancelar_turno,
    construir_detalle,
    listar_turnos,
    obtener_turno,
    reservar_turno,
)

router = APIRouter()
TZ_ESTUDIO = ZoneInfo("America/Argentina/Buenos_Aires")


@router.get("", response_model=list[TurnoDetalleOut])
def listar(
    desde: date | None = None,
    hasta: date | None = None,
    actividad_id: int | None = None,
    profesor_id: int | None = None,
    alumno_id: int | None = None,
    clase_id: int | None = None,
    estado: EstadoTurno | None = None,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    turnos = listar_turnos(
        db,
        usuario_actual,
        desde,
        hasta,
        actividad_id,
        profesor_id,
        alumno_id,
        clase_id,
        estado,
    )
    return [construir_detalle(db, t, usuario_actual) for t in turnos]


@router.post("", response_model=TurnoDetalleOut, status_code=status.HTTP_201_CREATED)
def reservar(
    data: TurnoCreate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_roles(RolUsuario.ALUMNO)),
):
    turno = reservar_turno(db, usuario_actual, data.clase_id)
    return construir_detalle(db, turno, usuario_actual)


@router.post("/{turno_id}/cancelar", response_model=TurnoDetalleOut)
def cancelar(
    turno_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    turno = obtener_turno(db, turno_id)
    if not turno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Turno no encontrado"
        )

    es_dueño = turno.alumno_id == usuario_actual.id
    if usuario_actual.rol == RolUsuario.PROFESOR or (
        usuario_actual.rol == RolUsuario.ALUMNO and not es_dueño
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tenés permisos para esta acción",
        )

    if turno.estado not in (EstadoTurno.CONFIRMADO, EstadoTurno.EN_ESPERA):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="El turno ya está cancelado"
        )

    if turno.clase.inicio <= datetime.now(tz=TZ_ESTUDIO):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="La clase ya comenzó"
        )

    turno = cancelar_turno(db, turno)
    return construir_detalle(db, turno, usuario_actual)