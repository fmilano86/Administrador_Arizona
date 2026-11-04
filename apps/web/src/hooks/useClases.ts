import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { cancelarClase, listClases } from "@/services/classService";
import type { ClaseFiltros } from "@/types";

export const claseKeys = {
  all: ["clases"] as const,
  list: (filtros: ClaseFiltros) => ["clases", filtros] as const,
};

export function useClases(
  filtros: ClaseFiltros,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: claseKeys.list(filtros),
    queryFn: () => listClases(filtros),
    enabled: options.enabled ?? true,
    placeholderData: keepPreviousData, // al cambiar de semana no parpadea la pantalla
  });
}

export function useCancelarClase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelarClase(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: claseKeys.all });
      qc.invalidateQueries({ queryKey: ["turnos"] });
    },
  });
}
