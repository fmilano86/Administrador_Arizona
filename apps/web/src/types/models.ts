// Entidades del dominio, alineadas con el modelo de datos de la sección 8 del README.md. Los nombres de campos están en snake_case a propósito, coinciden con lo que devuelve la API (Pydantic/SQLAlchemy), así no hace falta una capa de mapeo. Candidato a moverse a `packages/shared` cuando exista. Los valores de los enums marcados con (*) hay que confirmarlos con el backend.

export type Rol = "ALUMNO" | "PROFESOR" | "ADMINISTRADOR"; // (*)
export type EstadoBloque = "ACTIVO" | "CANCELADO"; // (*)
export type FrecuenciaBloque = "SEMANAL"; // (*)
export type EstadoClase = "PROGRAMADA" | "CANCELADA" | "FINALIZADA"; // (*)
export type EstadoTurno = "CONFIRMADO" | "CANCELADO"; // (*)
export type TipoTurno = "REGULAR" | "PRUEBA"; // (*)

// Fecha ISO 8601 con zona horaria (TIMESTAMPTZ).
export type IsoDateTime = string;
// Fecha sin hora, formato yyyy-MM-dd (DATE).
export type IsoDate = string;

export interface Usuario {
  id: number;
  rol: Rol;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  dni: string | null;
  fecha_nacimiento: IsoDate | null;
  fecha_alta: IsoDateTime;
  actualizado_en: IsoDateTime;
  eliminado_en: IsoDateTime | null;
}

export interface Actividad {
  id: number;
  nombre: string;
  descripcion: string | null;
  fecha_alta: IsoDateTime;
  actualizado_en: IsoDateTime;
  eliminado_en: IsoDateTime | null;
}

export interface BloqueClase {
  id: number;
  actividad_id: number;
  profesor_id: number;
  creado_por_id: number;
  fecha_desde: IsoDate;
  fecha_hasta: IsoDate;
  hora_inicio: string; // HH:mm
  hora_fin: string; // HH:mm
  frecuencia: FrecuenciaBloque;
  cupo_maximo: number;
  estado: EstadoBloque;
  fecha_alta: IsoDateTime;
  actualizado_en: IsoDateTime;
  eliminado_en: IsoDateTime | null;
}

export interface Clase {
  id: number;
  bloque_clase_id: number | null;
  actividad_id: number;
  profesor_id: number;
  inicio: IsoDateTime;
  fin: IsoDateTime;
  cupo_maximo: number;
  estado: EstadoClase;
  fecha_alta: IsoDateTime;
  actualizado_en: IsoDateTime;
  eliminado_en: IsoDateTime | null;
}

export interface Turno {
  id: number;
  alumno_id: number;
  clase_id: number;
  tipo: TipoTurno;
  estado: EstadoTurno;
  fecha_reserva: IsoDateTime;
  fecha_cancelacion: IsoDateTime | null;
  actualizado_en: IsoDateTime;
}

// Lo que la UI necesita ya "unido" desde la API (ver docs/contrato-api.md).

export interface UsuarioResumen {
  id: number;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string | null;
  fecha_nacimiento?: IsoDate | null;
}

export interface ClaseDetalle extends Clase {
  actividad: Pick<Actividad, "id" | "nombre">;
  profesor: UsuarioResumen;
  turnos_confirmados: number;
  cupos_disponibles: number;
  mi_turno?: Turno | null; // Solo para el rol ALUMNO: su turno confirmado en esta clase, si existe.
}

export interface TurnoDetalle extends Turno {
  clase: ClaseDetalle;
  alumno: UsuarioResumen;
}
