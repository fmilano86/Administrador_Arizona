from app.schemas.clase import ClaseDetalleOut
from app.schemas.turno import TurnoOut
from app.schemas.usuario import UsuarioResumenOut


class TurnoDetalleOut(TurnoOut):
    clase: ClaseDetalleOut
    alumno: UsuarioResumenOut