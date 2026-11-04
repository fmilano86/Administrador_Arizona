import { useMemo, useState } from "react";
import { CalendarCheck, CalendarOff, Users } from "lucide-react";
import { Link } from "react-router";

import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Skeleton,
} from "@/components/common";
import { ClaseStatusBadge } from "@/components/ui/ClaseStatusBadge";
import { ClassRosterModal } from "@/components/ui/ClassRosterModal";
import { CupoIndicator } from "@/components/ui/CupoIndicator";
import { StatCard } from "@/components/ui/StatCard";
import { useAuthStore } from "@/store/authStore";
import type { ClaseDetalle } from "@/types";
import {
  addDays,
  esHoy,
  formatDiaLargo,
  formatHora,
  parseISO,
  startOfDay,
  toApiDate,
} from "@/utils/dateUtils";

import { useProfesorClasses } from "../hooks/useProfesorClasses";

function FilaClase({
  clase,
  mostrarDia,
  onVer,
}: {
  clase: ClaseDetalle;
  mostrarDia?: boolean;
  onVer: (c: ClaseDetalle) => void;
}) {
  return (
    <li className="flex flex-wrap items-center gap-x-5 gap-y-3 py-4">
      <div className="w-24 shrink-0">
        <p className="font-display text-lg font-semibold tabular-nums">
          {formatHora(clase.inicio)}
        </p>
        {mostrarDia && (
          <p className="text-xs text-oliva-600">
            {formatDiaLargo(clase.inicio)}
          </p>
        )}
      </div>
      <div className="min-w-40 flex-1 space-y-1.5">
        <p className="font-medium">{clase.actividad.nombre}</p>
        <CupoIndicator
          ocupados={clase.turnos_confirmados}
          total={clase.cupo_maximo}
        />
      </div>
      <ClaseStatusBadge clase={clase} />
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onVer(clase)}
        leftIcon={<Users className="size-4" />}
      >
        Ver alumnos
      </Button>
    </li>
  );
}

export default function ProfesorInicioPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const hoy = useMemo(() => startOfDay(new Date()), []);
  const [seleccionada, setSeleccionada] = useState<ClaseDetalle | null>(null);

  const { clases, turnos, isLoading, isError, error, refetch } =
    useProfesorClasses({
      desde: toApiDate(hoy),
      hasta: toApiDate(addDays(hoy, 7)),
    });

  const activas = clases.filter((c) => c.estado !== "CANCELADA");
  const deHoy = activas.filter((c) => esHoy(c.inicio));
  const proximas = activas
    .filter((c) => parseISO(c.inicio) > addDays(hoy, 1) && !esHoy(c.inicio))
    .slice(0, 6);
  const idsHoy = new Set(deHoy.map((c) => c.id));
  const alumnosHoy = new Set(
    turnos.filter((t) => idsHoy.has(t.clase_id)).map((t) => t.alumno_id),
  ).size;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1>Hola, {usuario?.nombre}</h1>
        <p className="text-oliva-700">
          {isLoading
            ? "Cargando tu agenda…"
            : deHoy.length === 0
              ? "Hoy no tenés clases programadas."
              : `Hoy tenés ${deHoy.length} ${deHoy.length === 1 ? "clase programada" : "clases programadas"}.`}
        </p>
      </div>

      {isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
            <StatCard
              icon={<CalendarCheck />}
              label="Clases de hoy"
              value={deHoy.length}
            />
            <StatCard
              icon={<Users />}
              label="Alumnos de hoy"
              value={alumnosHoy}
              tone="terracota"
            />
          </div>

          <section aria-labelledby="agenda-hoy">
            <Card className="p-5 sm:p-6">
              <h2 id="agenda-hoy" className="text-h3 font-semibold">
                Tu agenda de hoy
              </h2>
              {deHoy.length === 0 ? (
                <EmptyState
                  icon={<CalendarOff />}
                  title="Sin clases hoy"
                  description="Tus próximas clases aparecen más abajo."
                />
              ) : (
                <ul className="mt-2 divide-y divide-oliva-100">
                  {deHoy.map((c) => (
                    <FilaClase key={c.id} clase={c} onVer={setSeleccionada} />
                  ))}
                </ul>
              )}
            </Card>
          </section>

          <section aria-labelledby="proximas">
            <Card className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 id="proximas" className="text-h3 font-semibold">
                  Próximas clases
                </h2>
                <Link
                  to="/profesor/turnos"
                  className="text-sm font-medium text-terracota-700 underline underline-offset-4"
                >
                  Ver todos los turnos
                </Link>
              </div>
              {proximas.length === 0 ? (
                <p className="py-6 text-sm text-oliva-600">
                  No tenés más clases en los próximos 7 días.
                </p>
              ) : (
                <ul className="mt-2 divide-y divide-oliva-100">
                  {proximas.map((c) => (
                    <FilaClase
                      key={c.id}
                      clase={c}
                      mostrarDia
                      onVer={setSeleccionada}
                    />
                  ))}
                </ul>
              )}
            </Card>
          </section>
        </>
      )}

      <ClassRosterModal
        clase={seleccionada}
        onClose={() => setSeleccionada(null)}
      />
    </div>
  );
}
