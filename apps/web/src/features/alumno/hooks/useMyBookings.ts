import { useMemo } from "react";

import { useTurnos } from "@/hooks/useTurnos";
import { parseISO, yaTermino } from "@/utils/dateUtils";

// Turnos del alumno logueado, separados en próximos e historial.
export function useMyBookings() {
  const query = useTurnos({});

  const { proximos, historial } = useMemo(() => {
    const todos = query.data ?? [];
    const esProximo = (t: (typeof todos)[number]) =>
      t.estado === "CONFIRMADO" &&
      t.clase.estado !== "CANCELADA" &&
      !yaTermino(t.clase.fin);

    const proximos = todos
      .filter(esProximo)
      .sort(
        (a, b) =>
          parseISO(a.clase.inicio).getTime() -
          parseISO(b.clase.inicio).getTime(),
      );
    const historial = todos
      .filter((t) => !esProximo(t))
      .sort(
        (a, b) =>
          parseISO(b.clase.inicio).getTime() -
          parseISO(a.clase.inicio).getTime(),
      );
    return { proximos, historial };
  }, [query.data]);

  return { ...query, proximos, historial };
}
