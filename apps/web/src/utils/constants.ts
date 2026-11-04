import type { Rol } from "@/types";

// Regla de negocio, cupo máximo por clase (README 3.1).
export const CUPO_MAXIMO = 7;

export const ESTUDIO = {
  nombre: "Arizona Health & Studio",
  zona: "Núñez",
} as const;

export const ROL_LABEL: Record<Rol, string> = {
  ALUMNO: "Alumno",
  PROFESOR: "Profesor",
  ADMINISTRADOR: "Administrador",
};

// Pantalla de inicio de cada rol.
export const ROL_HOME: Record<Rol, string> = {
  ALUMNO: "/alumno/inicio",
  PROFESOR: "/profesor/inicio",
  ADMINISTRADOR: "/admin/inicio",
};

// Cuando quedan estos lugares o menos, avisamos "Últimos lugares".
export const UMBRAL_ULTIMOS_LUGARES = 2;
