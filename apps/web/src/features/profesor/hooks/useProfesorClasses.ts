import { useMemo } from "react";

import { useClases } from "@/hooks/useClases";
import { useTurnos } from "@/hooks/useTurnos";
import { useAuthStore } from "@/store/authStore";
import type { IsoDate, TurnoDetalle } from "@/types";

// Clases del profesor logueado en un rango de fechas, junto con los alumnos inscriptos (turnos confirmados) agrupados por clase.
export function useProfesorClasses(rango: { desde: IsoDate; hasta: IsoDate }) {
  const profesorId = useAuthStore((s) => s.usuario?.id);
  const filtros = { ...rango, profesor_id: profesorId };
  const clases = useClases(filtros, { enabled: !!profesorId });
  const turnos = useTurnos(
    { ...filtros, estado: "CONFIRMADO" },
    { enabled: !!profesorId },
  );

  const turnosPorClase = useMemo(() => {
    const mapa = new Map<number, TurnoDetalle[]>();
    for (const t of turnos.data ?? []) {
      mapa.set(t.clase_id, [...(mapa.get(t.clase_id) ?? []), t]);
    }
    return mapa;
  }, [turnos.data]);

  return {
    clases: clases.data ?? [],
    turnos: turnos.data ?? [],
    turnosPorClase,
    isLoading: clases.isLoading || turnos.isLoading,
    isError: clases.isError || turnos.isError,
    error: clases.error ?? turnos.error,
    isPlaceholderData: clases.isPlaceholderData || turnos.isPlaceholderData,
    refetch: () => {
      clases.refetch();
      turnos.refetch();
    },
  };
}
