from sqlalchemy.orm import Session

from app.models.actividad import Actividad
from app.schemas.actividad import ActividadCreate, ActividadUpdate


def listar_actividades(db: Session) -> list[Actividad]:
    return db.query(Actividad).order_by(Actividad.nombre).all()


def crear_actividad(db: Session, data: ActividadCreate) -> Actividad:
    actividad = Actividad(nombre=data.nombre, descripcion=data.descripcion)
    db.add(actividad)
    db.commit()
    db.refresh(actividad)
    return actividad


def obtener_actividad(db: Session, actividad_id: int) -> Actividad | None:
    return db.query(Actividad).filter(Actividad.id == actividad_id).first()


def actualizar_actividad(
    db: Session, actividad: Actividad, data: ActividadUpdate
) -> Actividad:
    for campo, valor in data.model_dump(exclude_unset=True).items():
        setattr(actividad, campo, valor)
    db.commit()
    db.refresh(actividad)
    return actividad