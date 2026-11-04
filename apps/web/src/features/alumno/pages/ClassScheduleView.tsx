import { useMemo, useState } from "react";
import { CalendarSearch, ChevronLeft, ChevronRight } from "lucide-react";

import {
  Alert,
  Button,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
} from "@/components/common";
import { ClassCard } from "@/components/ui/ClassCard";
import { WeekStrip } from "@/components/ui/WeekStrip";
import { useActividades } from "@/hooks/useActividades";
import { useClases } from "@/hooks/useClases";
import { cn } from "@/lib/cn";
import type { ClaseDetalle } from "@/types";
import {
  addDays,
  diasDeSemana,
  esHoy,
  finSemana,
  formatDiaLargo,
  formatDiaSemanaCorto,
  formatRangoSemana,
  inicioSemana,
  isSameDay,
  parseISO,
  startOfDay,
  toApiDate,
  yaTermino,
} from "@/utils/dateUtils";

import { BookingConfirmModal } from "../components/BookingConfirmModal";

// Grilla semanal de clases con cupos y reserva.
export default function ClassScheduleView() {
  const [semana, setSemana] = useState(() => inicioSemana(new Date()));
  const [actividadId, setActividadId] = useState<number | null>(null);
  const [diaMovil, setDiaMovil] = useState(() => startOfDay(new Date()));
  const [seleccionada, setSeleccionada] = useState<ClaseDetalle | null>(null);

  const dias = useMemo(() => diasDeSemana(semana), [semana]);
  const actividades = useActividades();
  const clases = useClases({
    desde: toApiDate(semana),
    hasta: toApiDate(finSemana(semana)),
    actividad_id: actividadId ?? undefined,
  });

  const visibles = useMemo(
    () => (clases.data ?? []).filter((c) => c.estado !== "CANCELADA"),
    [clases.data],
  );
  const porDia = (dia: Date) =>
    visibles.filter((c) => isSameDay(parseISO(c.inicio), dia));
  const marcados = useMemo(
    () => new Set(visibles.map((c) => c.inicio.slice(0, 10))),
    [visibles],
  );

  const irASemana = (nueva: Date) => {
    setSemana(nueva);
    setDiaMovil(
      esHoy(nueva) || (nueva <= new Date() && new Date() <= addDays(nueva, 6))
        ? startOfDay(new Date())
        : nueva,
    );
  };

  const esSemanaActual = isSameDay(semana, inicioSemana(new Date()));
  const filtros = [
    { id: null, nombre: "Todas" },
    ...(actividades.data ?? []).filter((a) => !a.eliminado_en),
  ];
  const delDiaMovil = porDia(diaMovil);
  const semanaTerminada =
    esSemanaActual &&
    visibles.length > 0 &&
    visibles.every((c) => yaTermino(c.fin));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clases"
        subtitle="Elegí tu clase y reservá tu lugar. Cada clase tiene hasta 7 lugares."
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="Filtrar por actividad"
          className="flex flex-wrap gap-2"
        >
          {filtros.map((f) => (
            <button
              key={f.id ?? "todas"}
              type="button"
              aria-pressed={actividadId === f.id}
              onClick={() => setActividadId(f.id)}
              className={cn(
                "h-10 rounded-full border px-5 text-sm font-medium transition-colors",
                actividadId === f.id
                  ? "border-oliva-500 bg-oliva-500 text-marfil"
                  : "border-oliva-300 bg-papel text-oliva-800 hover:bg-oliva-100",
              )}
            >
              {f.nombre}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => irASemana(addDays(semana, -7))}
            aria-label="Semana anterior"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </Button>
          <p
            className="min-w-36 text-center text-sm font-medium tabular-nums"
            aria-live="polite"
          >
            {formatRangoSemana(semana)}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => irASemana(addDays(semana, 7))}
            aria-label="Semana siguiente"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </Button>
          {!esSemanaActual && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => irASemana(inicioSemana(new Date()))}
            >
              Esta semana
            </Button>
          )}
        </div>
      </div>

      {semanaTerminada && (
        <Alert tone="info">
          Las clases de esta semana ya terminaron.{" "}
          <button
            type="button"
            onClick={() => irASemana(addDays(semana, 7))}
            className="font-medium underline underline-offset-4"
          >
            Ver la semana siguiente
          </button>
        </Alert>
      )}

      {clases.isError ? (
        <ErrorState error={clases.error} onRetry={clases.refetch} />
      ) : clases.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : (
        <div
          className={cn(
            "transition-opacity",
            clases.isPlaceholderData && "opacity-60",
          )}
        >
          {/* Pantallas grandes: la semana completa en columnas */}
          <div className="hidden gap-3 xl:grid xl:grid-cols-7">
            {dias.map((dia) => {
              const clasesDia = porDia(dia);
              return (
                <section
                  key={dia.toISOString()}
                  aria-label={formatDiaLargo(dia)}
                  className="space-y-3"
                >
                  <header
                    className={cn(
                      "rounded-2xl py-2 text-center",
                      esHoy(dia)
                        ? "bg-terracota-600 text-marfil"
                        : "bg-oliva-100 text-oliva-800",
                    )}
                  >
                    <p className="text-xs">{formatDiaSemanaCorto(dia)}</p>
                    <p className="text-lg leading-tight font-semibold tabular-nums">
                      {dia.getDate()}
                    </p>
                  </header>
                  {clasesDia.length === 0 ? (
                    <p className="px-2 py-4 text-center text-xs text-oliva-500">
                      Sin clases
                    </p>
                  ) : (
                    clasesDia.map((c) => (
                      <ClassCard
                        key={c.id}
                        clase={c}
                        compact
                        onReservar={setSeleccionada}
                      />
                    ))
                  )}
                </section>
              );
            })}
          </div>

          {/* Pantallas chicas: un día por vez */}
          <div className="space-y-4 xl:hidden">
            <WeekStrip
              days={dias}
              selected={diaMovil}
              onSelect={setDiaMovil}
              marked={marcados}
              label="Días de la semana"
            />
            <h2 className="text-h3 text-oliva-800">
              {formatDiaLargo(diaMovil)}
            </h2>
            {delDiaMovil.length === 0 ? (
              <EmptyState
                icon={<CalendarSearch />}
                title="No hay clases este día"
                description="Probá con otro día o con otra actividad."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {delDiaMovil.map((c) => (
                  <ClassCard
                    key={c.id}
                    clase={c}
                    onReservar={setSeleccionada}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <BookingConfirmModal
        clase={seleccionada}
        onClose={() => setSeleccionada(null)}
      />
    </div>
  );
}
