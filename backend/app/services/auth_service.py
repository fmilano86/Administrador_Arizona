from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.usuario import RolUsuario, Usuario
from app.schemas.auth import RegisterRequest


def get_usuario_by_email(db: Session, email: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.email == email).first()


def authenticate(db: Session, email: str, password: str) -> Usuario | None:
    usuario = get_usuario_by_email(db, email)
    if not usuario or not verify_password(password, usuario.password_hash):
        return None
    return usuario


def registrar_alumno(db: Session, data: RegisterRequest) -> Usuario:
    usuario = Usuario(
        rol=RolUsuario.ALUMNO,
        nombre=data.nombre,
        apellido=data.apellido,
        email=data.email,
        password_hash=hash_password(data.password),
        telefono=data.telefono,
        fecha_nacimiento=data.fecha_nacimiento,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


def generar_token(usuario: Usuario) -> str:
    return create_access_token(subject=str(usuario.id), rol=usuario.rol.value)