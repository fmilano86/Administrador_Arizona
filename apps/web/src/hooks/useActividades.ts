import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  actualizarActividad,
  cambiarEstadoActividad,
  crearActividad,
  listActividades,
} from "@/services/activityService";
import type { ActividadInput } from "@/types";

export const actividadKeys = { all: ["actividades"] as const };

export function useActividades() {
  return useQuery({ queryKey: actividadKeys.all, queryFn: listActividades });
}

export function useGuardarActividad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: number; input: ActividadInput }) =>
      id ? actualizarActividad(id, input) : crearActividad(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: actividadKeys.all }),
  });
}

export function useCambiarEstadoActividad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activa }: { id: number; activa: boolean }) =>
      cambiarEstadoActividad(id, activa),
    onSuccess: () => qc.invalidateQueries({ queryKey: actividadKeys.all }),
  });
}
