import { api } from "@/lib/axios";
import type { TurnoDetalle, TurnoFiltros } from "@/types";

export const listTurnos = (filtros: TurnoFiltros = {}) =>
  api.get<TurnoDetalle[]>("/turnos", { params: filtros }).then((r) => r.data);

// El alumno se toma del token: solo se envía la clase.
export const reservarTurno = (claseId: number) =>
  api.post<TurnoDetalle>("/turnos", { clase_id: claseId }).then((r) => r.data);

export const cancelarTurno = (turnoId: number) =>
  api.post<TurnoDetalle>(`/turnos/${turnoId}/cancelar`).then((r) => r.data);
