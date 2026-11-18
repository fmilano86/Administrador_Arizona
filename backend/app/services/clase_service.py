from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.clase import Clase, EstadoClase
from app.models.turno import EstadoTurno, Turno
from app.models.usuario import RolUsuario, Usuario
from app.schemas.actividad import ActividadResumenOut
from app.schemas.clase import ClaseDetalleOut
from app.schemas.turno import TurnoOut
from app.schemas.usuario import UsuarioResumenOut

TZ_ESTUDIO = ZoneInfo("America/Argentina/Buenos_Aires")


def _inicio_dia(fecha: date) -> datetime:
    return datetime.combine(fecha, time.min, tzinfo=TZ_ESTUDIO)


def listar_clases(
    db: Session,
    usuario_actual: Usuario,
    desde: date | None = None,
    hasta: date | None = None,
    actividad_id: int | None = None,
    profesor_id: int | None = None,
    estado: EstadoClase | None = None,
) -> list[Clase]:
    query = db.query(Clase)

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
    if estado is not None:
        query = query.filter(Clase.estado == estado)

    return query.order_by(Clase.inicio).all()


def obtener_clase(db: Session, clase_id: int) -> Clase | None:
    return db.query(Clase).filter(Clase.id == clase_id).first()


def _contar_turnos_confirmados(db: Session, clase_id: int) -> int:
    return (
        db.query(func.count(Turno.id))
        .filter(Turno.clase_id == clase_id, Turno.estado == EstadoTurno.CONFIRMADO)
        .scalar()
    )


def _obtener_mi_turno(db: Session, clase_id: int, alumno_id: int) -> Turno | None:
    return (
        db.query(Turno)
        .filter(
            Turno.clase_id == clase_id,
            Turno.alumno_id == alumno_id,
            Turno.estado == EstadoTurno.CONFIRMADO,
        )
        .first()
    )


def construir_detalle(
    db: Session, clase: Clase, usuario_actual: Usuario
) -> ClaseDetalleOut:
    confirmados = _contar_turnos_confirmados(db, clase.id)

    mi_turno = None
    if usuario_actual.rol == RolUsuario.ALUMNO:
        turno = _obtener_mi_turno(db, clase.id, usuario_actual.id)
        mi_turno = TurnoOut.model_validate(turno) if turno else None

    return ClaseDetalleOut(
        id=clase.id,
        bloque_clase_id=clase.bloque_clase_id,
        actividad_id=clase.actividad_id,
        profesor_id=clase.profesor_id,
        inicio=clase.inicio,
        fin=clase.fin,
        cupo_maximo=clase.cupo_maximo,
        estado=clase.estado,
        fecha_alta=clase.fecha_alta,
        actualizado_en=clase.actualizado_en,
        eliminado_en=clase.eliminado_en,
        actividad=ActividadResumenOut.model_validate(clase.actividad),
        profesor=UsuarioResumenOut.model_validate(clase.profesor),
        turnos_confirmados=confirmados,
        cupos_disponibles=clase.cupo_maximo - confirmados,
        mi_turno=mi_turno,
    )


def cancelar_clase(db: Session, clase: Clase) -> Clase:
    clase.estado = EstadoClase.CANCELADA

    ahora = datetime.now(tz=TZ_ESTUDIO)
    turnos = (
        db.query(Turno)
        .filter(Turno.clase_id == clase.id, Turno.estado == EstadoTurno.CONFIRMADO)
        .all()
    )
    for turno in turnos:
        turno.estado = EstadoTurno.CANCELADO
        turno.fecha_cancelacion = ahora

    db.commit()
    db.refresh(clase)
    return clase