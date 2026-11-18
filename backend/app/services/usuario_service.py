from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.usuario import RolUsuario, Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate


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