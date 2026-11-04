import { useMemo, useState } from "react";
import { CalendarSearch, Users } from "lucide-react";

import {
  Avatar,
  Button,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
} from "@/components/common";
import { ClaseStatusBadge } from "@/components/ui/ClaseStatusBadge";
import { ClassRosterModal } from "@/components/ui/ClassRosterModal";
import { CupoIndicator } from "@/components/ui/CupoIndicator";
import { cn } from "@/lib/cn";
import type { ClaseDetalle } from "@/types";
import {
  addDays,
  formatDiaLargo,
  formatHora,
  rangoHorario,
  startOfDay,
  toApiDate,
} from "@/utils/dateUtils";

import {
  ClassFilterBar,
  type ProfesorFiltros,
} from "../components/ClassFilterBar";
import { useProfesorClasses } from "../hooks/useProfesorClasses";

const filtrosIniciales = (): ProfesorFiltros => {
  const hoy = startOfDay(new Date());
  return { desde: toApiDate(hoy), hasta: toApiDate(addDays(hoy, 6)), hora: "" };
};

// Turnos reservados en las clases del profesor, por día, con filtro por fecha y horario.
export default function MyClassesPage() {
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const [seleccionada, setSeleccionada] = useState<ClaseDetalle | null>(null);

  const rangoValido =
    !!filtros.desde && !!filtros.hasta && filtros.hasta >= filtros.desde;
  const {
    clases,
    turnosPorClase,
    isLoading,
    isError,
    error,
    refetch,
    isPlaceholderData,
  } = useProfesorClasses({
    desde: rangoValido ? filtros.desde : toApiDate(new Date()),
    hasta: rangoValido ? filtros.hasta : toApiDate(new Date()),
  });

  const horarios = useMemo(
    () => [...new Set(clases.map((c) => formatHora(c.inicio)))].sort(),
    [clases],
  );
  const visibles = clases.filter(
    (c) => !filtros.hora || formatHora(c.inicio) === filtros.hora,
  );

  const porDia = useMemo(() => {
    const mapa = new Map<string, ClaseDetalle[]>();
    for (const c of visibles) {
      const dia = c.inicio.slice(0, 10);
      mapa.set(dia, [...(mapa.get(dia) ?? []), c]);
    }
    return [...mapa.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [visibles]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis turnos"
        subtitle="Las reservas de tus clases y quiénes están inscriptos."
      />

      <ClassFilterBar
        value={filtros}
        horarios={horarios}
        onChange={setFiltros}
        onReset={() => setFiltros(filtrosIniciales())}
      />

      {!rangoValido ? (
        <EmptyState
          icon={<CalendarSearch />}
          title="Revisá las fechas"
          description="La fecha final no puede ser anterior a la inicial."
        />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      ) : porDia.length === 0 ? (
        <EmptyState
          icon={<CalendarSearch />}
          title="No hay clases con estos filtros"
          description="Probá con otro rango de fechas u otro horario."
        />
      ) : (
        <div
          className={cn(
            "space-y-8 transition-opacity",
            isPlaceholderData && "opacity-60",
          )}
        >
          {porDia.map(([dia, clasesDia]) => (
            <section
              key={dia}
              aria-labelledby={`dia-${dia}`}
              className="space-y-3"
            >
              <h2 id={`dia-${dia}`} className="text-h3 text-oliva-800">
                {formatDiaLargo(clasesDia[0].inicio)}
              </h2>
              <ul className="space-y-3">
                {clasesDia.map((c) => {
                  const alumnos = turnosPorClase.get(c.id) ?? [];
                  return (
                    <li key={c.id}>
                      <Card className="p-5">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                          <div className="min-w-32">
                            <p className="font-display text-lg font-semibold tabular-nums">
                              {rangoHorario(c.inicio, c.fin)}
                            </p>
                            <p className="text-sm text-oliva-700">
                              {c.actividad.nombre}
                            </p>
                          </div>
                          <CupoIndicator
                            ocupados={c.turnos_confirmados}
                            total={c.cupo_maximo}
                          />
                          <ClaseStatusBadge clase={c} />
                          <Button
                            variant="secondary"
                            size="sm"
                            className="ml-auto"
                            onClick={() => setSeleccionada(c)}
                            leftIcon={<Users className="size-4" />}
                          >
                            Datos de alumnos
                          </Button>
                        </div>
                        {alumnos.length === 0 ? (
                          <p className="mt-4 text-sm text-oliva-600">
                            Todavía no hay alumnos inscriptos.
                          </p>
                        ) : (
                          <ul className="mt-4 flex flex-wrap gap-2">
                            {alumnos.map((t) => (
                              <li
                                key={t.id}
                                className="flex items-center gap-2 rounded-full bg-oliva-50 py-1 pr-3.5 pl-1 text-sm"
                              >
                                <Avatar
                                  nombre={t.alumno.nombre}
                                  apellido={t.alumno.apellido}
                                  size="sm"
                                />
                                {t.alumno.nombre} {t.alumno.apellido}
                              </li>
                            ))}
                          </ul>
                        )}
                      </Card>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <ClassRosterModal
        clase={seleccionada}
        onClose={() => setSeleccionada(null)}
      />
    </div>
  );
}
