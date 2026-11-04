import type { ClaseDetalle } from "@/types";

import { UMBRAL_ULTIMOS_LUGARES } from "./constants";
import { yaComenzo, yaTermino } from "./dateUtils";

export type ClaseStatus =
  | "CANCELADA"
  | "FINALIZADA"
  | "EN_CURSO"
  | "COMPLETA"
  | "ULTIMOS_LUGARES"
  | "DISPONIBLE";

// Estado "visible" de una clase combinando su estado, la hora y los cupos.
export function claseStatus(clase: ClaseDetalle): ClaseStatus {
  if (clase.estado === "CANCELADA") return "CANCELADA";
  if (clase.estado === "FINALIZADA" || yaTermino(clase.fin))
    return "FINALIZADA";
  if (yaComenzo(clase.inicio)) return "EN_CURSO";
  if (clase.cupos_disponibles <= 0) return "COMPLETA";
  if (clase.cupos_disponibles <= UMBRAL_ULTIMOS_LUGARES)
    return "ULTIMOS_LUGARES";
  return "DISPONIBLE";
}

// ¿Un alumno puede reservar esta clase ahora?
export function sePuedeReservar(clase: ClaseDetalle) {
  if (clase.mi_turno) return false;
  const status = claseStatus(clase);
  return status === "DISPONIBLE" || status === "ULTIMOS_LUGARES";
}

export const nombreCompleto = (u: { nombre: string; apellido: string }) =>
  `${u.nombre} ${u.apellido}`;
