import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  cancelarTurno,
  listTurnos,
  reservarTurno,
} from "@/services/turnoService";
import type { TurnoFiltros } from "@/types";

export const turnoKeys = {
  all: ["turnos"] as const,
  list: (filtros: TurnoFiltros) => ["turnos", filtros] as const,
};

export function useTurnos(
  filtros: TurnoFiltros,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: turnoKeys.list(filtros),
    queryFn: () => listTurnos(filtros),
    enabled: options.enabled ?? true,
    placeholderData: keepPreviousData,
  });
}

// Reservar o cancelar cambia cupos y turnos: se refrescan ambas listas.
function useRefrescarCupos() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["clases"] });
    qc.invalidateQueries({ queryKey: turnoKeys.all });
  };
}

export function useReservarTurno() {
  const refrescar = useRefrescarCupos();
  return useMutation({
    mutationFn: (claseId: number) => reservarTurno(claseId),
    onSettled: refrescar,
  });
}

export function useCancelarTurno() {
  const refrescar = useRefrescarCupos();
  return useMutation({
    mutationFn: (turnoId: number) => cancelarTurno(turnoId),
    onSettled: refrescar,
  });
}
