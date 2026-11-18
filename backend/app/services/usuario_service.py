from datetime import date, datetime
from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.usuario import RolUsuario, Usuario
from app.schemas.usuario import CumpleanioOut, UsuarioCreate, UsuarioUpdate

TZ_ESTUDIO = ZoneInfo("America/Argentina/Buenos_Aires")


def listar_usuarios(db: Session, rol: RolUsuario) -> list[Usuario]:
    return (
        db.query(Usuario)
        .filter(Usuario.rol == rol)
        .order_by(Usuario.apellido, Usuario.nombre)
        .all()
    )


def obtener_usuario(db: Session, usuario_id: int) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.id == usuario_id).first()


def obtener_usuario_por_email(db: Session, email: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.email == email).first()


def crear_usuario(db: Session, data: UsuarioCreate) -> Usuario:
    usuario = Usuario(
        rol=data.rol,
        nombre=data.nombre,
        apellido=data.apellido,
        email=data.email,
        telefono=data.telefono,
        dni=data.dni,
        fecha_nacimiento=data.fecha_nacimiento,
        password_hash=hash_password(data.password),
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


def actualizar_usuario(db: Session, usuario: Usuario, data: UsuarioUpdate) -> Usuario:
    cambios = data.model_dump(exclude_unset=True, exclude={"password"})
    for campo, valor in cambios.items():
        setattr(usuario, campo, valor)
    if data.password is not None:
        usuario.password_hash = hash_password(data.password)
    db.commit()
    db.refresh(usuario)
    return usuario


def obtener_usuario_por_dni(db: Session, dni: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.dni == dni).first()


def _proximo_cumpleanio(fecha_nacimiento: date, hoy: date) -> date:
    try:
        candidato = fecha_nacimiento.replace(year=hoy.year)
    except ValueError:
        # 29 de febrero en un año no bisiesto: lo corremos al 28.
        candidato = fecha_nacimiento.replace(year=hoy.year, day=28)
    if candidato < hoy:
        try:
            candidato = candidato.replace(year=hoy.year + 1)
        except ValueError:
            candidato = candidato.replace(year=hoy.year + 1, day=28)
    return candidato


def listar_cumpleanios(
    db: Session, dias: int = 7, rol: RolUsuario | None = None
) -> list[CumpleanioOut]:
    hoy = datetime.now(tz=TZ_ESTUDIO).date()

    query = db.query(Usuario).filter(
        Usuario.fecha_nacimiento.isnot(None), Usuario.eliminado_en.is_(None)
    )
    if rol is not None:
        query = query.filter(Usuario.rol == rol)

    resultado = []
    for usuario in query.all():
        proximo = _proximo_cumpleanio(usuario.fecha_nacimiento, hoy)
        dias_restantes = (proximo - hoy).days
        if dias_restantes <= dias:
            resultado.append(
                CumpleanioOut(
                    id=usuario.id,
                    nombre=usuario.nombre,
                    apellido=usuario.apellido,
                    rol=usuario.rol,
                    fecha_nacimiento=usuario.fecha_nacimiento,
                    dias_restantes=dias_restantes,
                    cumple_hoy=dias_restantes == 0,
                )
            )

    resultado.sort(key=lambda c: c.dias_restantes)
    return resultado