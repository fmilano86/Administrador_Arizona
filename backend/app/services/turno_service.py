from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.clase import Clase, EstadoClase
from app.models.turno import EstadoTurno, TipoTurno, Turno
from app.models.usuario import RolUsuario, Usuario
from app.schemas.turno_detalle import TurnoDetalleOut
from app.schemas.usuario import UsuarioResumenOut
from app.services.clase_service import construir_detalle as construir_detalle_clase

TZ_ESTUDIO = ZoneInfo("America/Argentina/Buenos_Aires")


def _inicio_dia(fecha: date) -> datetime:
    return datetime.combine(fecha, time.min, tzinfo=TZ_ESTUDIO)


def listar_turnos(
    db: Session,
    usuario_actual: Usuario,
    desde: date | None = None,
    hasta: date | None = None,
    actividad_id: int | None = None,
    profesor_id: int | None = None,
    alumno_id: int | None = None,
    clase_id: int | None = None,
    estado: EstadoTurno | None = None,
) -> list[Turno]:
    query = db.query(Turno).join(Clase, Turno.clase_id == Clase.id)

    if usuario_actual.rol == RolUsuario.ALUMNO:
        query = query.filter(Turno.alumno_id == usuario_actual.id)
    elif alumno_id is not None:
        query = query.filter(Turno.alumno_id == alumno_id)

    if usuario_actual.rol == RolUsuario.PROFESOR:
        query = query.filter(Clase.profesor_id == usuario_actual.id)
    elif profesor_id is not None:
        query = query.filter(Clase.profesor_id == profesor_id)

    if desde is not None:
        query = query.filter(Clase.inicio >= _inicio_dia(desde))
    if hasta is not None:
        query = query.filter(Clase.inicio < _inicio_dia(hasta + timedelta(days=1)))
    if actividad_id is not None:
        query = query.filter(Clase.actividad_id == actividad_id)
    if clase_id is not None:
        query = query.filter(Turno.clase_id == clase_id)
    if estado is not None:
        query = query.filter(Turno.estado == estado)

    return query.order_by(Clase.inicio).all()


def obtener_turno(db: Session, turno_id: int) -> Turno | None:
    return db.query(Turno).filter(Turno.id == turno_id).first()


def construir_detalle(
    db: Session, turno: Turno, usuario_actual: Usuario
) -> TurnoDetalleOut:
    clase_detalle = construir_detalle_clase(db, turno.clase, usuario_actual)
    return TurnoDetalleOut(
        id=turno.id,
        alumno_id=turno.alumno_id,
        clase_id=turno.clase_id,
        tipo=turno.tipo,
        estado=turno.estado,
        fecha_reserva=turno.fecha_reserva,
        fecha_cancelacion=turno.fecha_cancelacion,
        actualizado_en=turno.actualizado_en,
        clase=clase_detalle,
        alumno=UsuarioResumenOut.model_validate(turno.alumno),
    )


def _es_primera_reserva(
    db: Session, alumno_id: int, excluir_turno_id: int | None = None
) -> bool:
    query = db.query(Turno.id).filter(Turno.alumno_id == alumno_id)
    if excluir_turno_id is not None:
        query = query.filter(Turno.id != excluir_turno_id)
    return query.first() is None


def reservar_turno(db: Session, alumno: Usuario, clase_id: int) -> Turno:
    clase = db.query(Clase).filter(Clase.id == clase_id).first()
    if clase is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Clase no encontrada"
        )

    ahora = datetime.now(tz=TZ_ESTUDIO)
    if clase.estado != EstadoClase.PROGRAMADA:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="La clase está cancelada"
        )
    if clase.inicio <= ahora:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="La clase ya comenzó"
        )

    confirmados = (
        db.query(func.count(Turno.id))
        .filter(Turno.clase_id == clase_id, Turno.estado == EstadoTurno.CONFIRMADO)
        .scalar()
    )
    if confirmados >= clase.cupo_maximo:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="La clase está completa"
        )

    turno_existente = (
        db.query(Turno)
        .filter(Turno.alumno_id == alumno.id, Turno.clase_id == clase_id)
        .first()
    )
    if turno_existente and turno_existente.estado == EstadoTurno.CONFIRMADO:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya tenés un turno en esta clase",
        )

    superpuesto = (
        db.query(Turno)
        .join(Clase, Turno.clase_id == Clase.id)
        .filter(
            Turno.alumno_id == alumno.id,
            Turno.estado == EstadoTurno.CONFIRMADO,
            Turno.clase_id != clase_id,
            Clase.inicio < clase.fin,
            Clase.fin > clase.inicio,
        )
        .first()
    )
    if superpuesto:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya tenés otro turno que se superpone con el horario de esta clase",
        )

    es_primera = _es_primera_reserva(
        db, alumno.id, turno_existente.id if turno_existente else None
    )
    if es_primera:
        tipo = TipoTurno.PRUEBA
    elif clase.bloque_clase_id is not None:
        tipo = TipoTurno.RECURRENTE
    else:
        tipo = TipoTurno.PUNTUAL

    if turno_existente:
        turno_existente.estado = EstadoTurno.CONFIRMADO
        turno_existente.fecha_cancelacion = None
        turno_existente.tipo = tipo
        turno = turno_existente
    else:
        turno = Turno(
            alumno_id=alumno.id,
            clase_id=clase_id,
            tipo=tipo,
            estado=EstadoTurno.CONFIRMADO,
        )
        db.add(turno)

    db.commit()
    db.refresh(turno)
    return turno

def cancelar_turno(db: Session, turno: Turno) -> Turno:
    turno.estado = EstadoTurno.CANCELADO
    turno.fecha_cancelacion = datetime.now(tz=TZ_ESTUDIO)
    db.commit()
    db.refresh(turno)
    return turno