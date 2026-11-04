import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelarBloque,
  crearBloque,
  listBloques,
} from "@/services/bloqueService";
import type { BloqueInput } from "@/types";

export const bloqueKeys = { all: ["bloques"] as const };

export function useBloques() {
  return useQuery({ queryKey: bloqueKeys.all, queryFn: listBloques });
}

function useRefrescarHorarios() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: bloqueKeys.all });
    qc.invalidateQueries({ queryKey: ["clases"] });
    qc.invalidateQueries({ queryKey: ["turnos"] });
  };
}

export function useCrearBloque() {
  const refrescar = useRefrescarHorarios();
  return useMutation({
    mutationFn: (input: BloqueInput) => crearBloque(input),
    onSuccess: refrescar,
  });
}

export function useCancelarBloque() {
  const refrescar = useRefrescarHorarios();
  return useMutation({
    mutationFn: (id: number) => cancelarBloque(id),
    onSuccess: refrescar,
  });
}
