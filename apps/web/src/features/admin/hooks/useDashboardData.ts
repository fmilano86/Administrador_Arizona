import { useMemo } from "react";

import { useClases } from "@/hooks/useClases";
import { useUsuarios } from "@/hooks/useUsuarios";
import type { BarDatum } from "@/components/ui/BarChart";
import {
  diasDeSemana,
  esHoy,
  finSemana,
  formatDiaSemanaCorto,
  inicioSemana,
  isSameDay,
  parseISO,
  startOfDay,
  toApiDate,
} from "@/utils/dateUtils";

// Datos del tablero del administrador, calculados con las clases de la semana.
export function useDashboardData() {
  const hoy = useMemo(() => startOfDay(new Date()), []);
  const inicio = inicioSemana(hoy);
  const clases = useClases({
    desde: toApiDate(inicio),
    hasta: toApiDate(finSemana(hoy)),
  });
  const alumnos = useUsuarios("ALUMNO");

  const datos = useMemo(() => {
    const activas = (clases.data ?? []).filter((c) => c.estado !== "CANCELADA");
    const deHoy = activas.filter((c) => esHoy(c.inicio));

    const suma = (
      lista: typeof activas,
      campo: "turnos_confirmados" | "cupo_maximo",
    ) => lista.reduce((total, c) => total + c[campo], 0);

    const ocupadosHoy = suma(deHoy, "turnos_confirmados");
    const cupoHoy = suma(deHoy, "cupo_maximo");

    const reservasPorDia: BarDatum[] = diasDeSemana(inicio).map((dia) => ({
      label: formatDiaSemanaCorto(dia),
      value: suma(
        activas.filter((c) => isSameDay(parseISO(c.inicio), dia)),
        "turnos_confirmados",
      ),
      highlight: isSameDay(dia, hoy),
    }));

    const alumnosActivos = (alumnos.data ?? []).filter((a) => !a.eliminado_en);
    const recientes = [...alumnosActivos]
      .sort((a, b) => b.fecha_alta.localeCompare(a.fecha_alta))
      .slice(0, 5);

    return {
      deHoy,
      ocupadosHoy,
      ocupacionHoy: cupoHoy ? Math.round((ocupadosHoy / cupoHoy) * 100) : 0,
      ocupadosSemana: suma(activas, "turnos_confirmados"),
      cupoSemana: suma(activas, "cupo_maximo"),
      reservasPorDia,
      alumnosActivos: alumnosActivos.length,
      recientes,
    };
  }, [clases.data, alumnos.data, hoy, inicio]);

  return {
    ...datos,
    isLoading: clases.isLoading || alumnos.isLoading,
    isError: clases.isError || alumnos.isError,
    error: clases.error ?? alumnos.error,
    refetch: () => {
      clases.refetch();
      alumnos.refetch();
    },
  };
}
