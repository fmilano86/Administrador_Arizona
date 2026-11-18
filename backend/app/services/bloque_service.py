from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session

from app.models.bloque_clase import BloqueClase, EstadoBloque
from app.models.clase import Clase, EstadoClase
from app.models.turno import EstadoTurno, Turno
from app.models.usuario import Usuario
from app.schemas.bloque import BloqueCreate

TZ_ESTUDIO = ZoneInfo("America/Argentina/Buenos_Aires")


def listar_bloques(db: Session) -> list[BloqueClase]:
    return db.query(BloqueClase).order_by(BloqueClase.fecha_desde.desc()).all()


def obtener_bloque(db: Session, bloque_id: int) -> BloqueClase | None:
    return db.query(BloqueClase).filter(BloqueClase.id == bloque_id).first()


def crear_bloque(
    db: Session, data: BloqueCreate, creado_por: Usuario
) -> tuple[BloqueClase, int]:
    bloque = BloqueClase(
        actividad_id=data.actividad_id,
        profesor_id=data.profesor_id,
        creado_por_id=creado_por.id,
        fecha_desde=data.fecha_desde,
        fecha_hasta=data.fecha_hasta,
        hora_inicio=data.hora_inicio,
        hora_fin=data.hora_fin,
        cupo_maximo=data.cupo_maximo,
    )
    db.add(bloque)
    db.flush()  # para tener bloque.id antes de crear las clases

    dias = (data.fecha_hasta - data.fecha_desde).days
    cantidad = 0 if dias < 0 else dias // 7 + 1

    for i in range(cantidad):
        fecha = data.fecha_desde + timedelta(weeks=i)
        inicio = datetime.combine(fecha, data.hora_inicio, tzinfo=TZ_ESTUDIO)
        fin = datetime.combine(fecha, data.hora_fin, tzinfo=TZ_ESTUDIO)
        db.add(
            Clase(
                bloque_clase_id=bloque.id,
                actividad_id=data.actividad_id,
                profesor_id=data.profesor_id,
                inicio=inicio,
                fin=fin,
                cupo_maximo=data.cupo_maximo,
                estado=EstadoClase.PROGRAMADA,
            )
        )

    db.commit()
    db.refresh(bloque)
    return bloque, cantidad


def cancelar_bloque(db: Session, bloque: BloqueClase) -> BloqueClase:
    bloque.estado = EstadoBloque.CANCELADO

    ahora = datetime.now(tz=TZ_ESTUDIO)
    clases_futuras = (
        db.query(Clase)
        .filter(
            Clase.bloque_clase_id == bloque.id,
            Clase.estado == EstadoClase.PROGRAMADA,
            Clase.inicio > ahora,
        )
        .all()
    )
    for clase in clases_futuras:
        clase.estado = EstadoClase.CANCELADA
        turnos = (
            db.query(Turno)
            .filter(Turno.clase_id == clase.id, Turno.estado == EstadoTurno.CONFIRMADO)
            .all()
        )
        for turno in turnos:
            turno.estado = EstadoTurno.CANCELADO
            turno.fecha_cancelacion = ahora

    db.commit()
    db.refresh(bloque)
    return bloque