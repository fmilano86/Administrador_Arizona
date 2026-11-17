from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UsuarioOut
from app.services.auth_service import (
    authenticate,
    generar_token,
    get_usuario_by_email,
    registrar_alumno,
)

router = APIRouter()


@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    usuario = authenticate(db, data.email, data.password)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
        )
    token = generar_token(usuario)
    return AuthResponse(access_token=token, usuario=usuario)


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    if get_usuario_by_email(db, data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una cuenta con ese email",
        )
    usuario = registrar_alumno(db, data)
    token = generar_token(usuario)
    return AuthResponse(access_token=token, usuario=usuario)


@router.get("/me", response_model=UsuarioOut)
def me(usuario=Depends(get_current_user)):
    return usuario