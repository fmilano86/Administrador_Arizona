import { api } from "@/lib/axios";
import type { Actividad, ActividadInput } from "@/types";

export const listActividades = () =>
  api.get<Actividad[]>("/actividades").then((r) => r.data);

export const crearActividad = (input: ActividadInput) =>
  api.post<Actividad>("/actividades", input).then((r) => r.data);

export const actualizarActividad = (
  id: number,
  input: Partial<ActividadInput>,
) => api.patch<Actividad>(`/actividades/${id}`, input).then((r) => r.data);

// Baja lógica: se marca `eliminado_en`. Reactivar = volver a null.
export const cambiarEstadoActividad = (id: number, activa: boolean) =>
  api
    .patch<Actividad>(`/actividades/${id}`, {
      eliminado_en: activa ? null : new Date().toISOString(),
    })
    .then((r) => r.data);
