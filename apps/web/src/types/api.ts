import type {
  Actividad,
  BloqueClase,
  EstadoClase,
  EstadoTurno,
  IsoDate,
  Rol,
  Usuario,
} from "./models";

// Respuesta de POST /auth/login y POST /auth/register.
export interface AuthResponse {
  access_token: string;
  token_type: "bearer";
  usuario: Usuario;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  fecha_nacimiento?: IsoDate;
}

export interface ClaseFiltros {
  desde?: IsoDate;
  hasta?: IsoDate;
  actividad_id?: number;
  profesor_id?: number;
  estado?: EstadoClase;
}

export interface TurnoFiltros {
  desde?: IsoDate;
  hasta?: IsoDate;
  actividad_id?: number;
  profesor_id?: number;
  alumno_id?: number;
  clase_id?: number;
  estado?: EstadoTurno;
}

export type ActividadInput = Pick<Actividad, "nombre"> & {
  descripcion?: string | null;
};

export interface UsuarioInput {
  rol: Rol;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  dni?: string | null;
  fecha_nacimiento?: IsoDate | null;
  /** Solo al crear: contraseña inicial. */
  password?: string;
}

export interface BloqueInput {
  actividad_id: number;
  profesor_id: number;
  fecha_desde: IsoDate;
  fecha_hasta: IsoDate;
  hora_inicio: string;
  hora_fin: string;
  cupo_maximo: number;
}

export interface BloqueCreado {
  bloque: BloqueClase;
  clases_generadas: number;
}

// Formas de error que puede devolver la API (FastAPI).
export interface ApiErrorBody {
  detail?: string | { msg?: string; message?: string }[] | { message?: string };
  message?: string;
}
