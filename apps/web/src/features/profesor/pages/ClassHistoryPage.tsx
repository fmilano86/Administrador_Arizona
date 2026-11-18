import { useMemo, useState } from "react";
import { History } from "lucide-react";

import {
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Skeleton,
} from "@/components/common";
import { ClaseStatusBadge } from "@/components/ui/ClaseStatusBadge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import type { ClaseDetalle } from "@/types";
import {
  addDays,
  formatDiaMes,
  rangoHorario,
  startOfDay,
  toApiDate,
} from "@/utils/dateUtils";

import { useProfesorClasses } from "../hooks/useProfesorClasses";

// Historial simple: qué clases dio el profesor y cuántos alumnos tuvo cada una.
export default function ClassHistoryPage() {
  const hoy = startOfDay(new Date());
  const [desde, setDesde] = useState(toApiDate(addDays(hoy, -30)));
  const [hasta, setHasta] = useState(toApiDate(hoy));

  const rangoValido = !!desde && !!hasta && hasta >= desde;
  const { clases, isLoading, isError, error, refetch } = useProfesorClasses({
    desde: rangoValido ? desde : toApiDate(hoy),
    hasta: rangoValido ? hasta : toApiDate(hoy),
  });

  const ordenadas = useMemo(
    () => [...clases].sort((a, b) => b.inicio.localeCompare(a.inicio)),
    [clases],
  );

  const columnas: Column<ClaseDetalle>[] = [
    {
      key: "fecha",
      header: "Fecha",
      className: "whitespace-nowrap font-medium",
      cell: (c) => formatDiaMes(c.inicio),
    },
    {
      key: "horario",
      header: "Horario",
      className: "tabular-nums",
      cell: (c) => rangoHorario(c.inicio, c.fin),
    },
    { key: "actividad", header: "Actividad", cell: (c) => c.actividad.nombre },
    {
      key: "alumnos",
      header: "Alumnos",
      className: "tabular-nums",
      cell: (c) => c.turnos_confirmados,
    },
    {
      key: "estado",
      header: "Estado",
      cell: (c) => <ClaseStatusBadge clase={c} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historial"
        subtitle="Las clases que diste, con cuántos alumnos tuvo cada una."
      />

      <Card className="flex flex-wrap items-end gap-4 p-4 sm:p-5">
        <Input
          label="Desde"
          type="date"
          value={desde}
          max={hasta || undefined}
          onChange={(e) => setDesde(e.target.value)}
        />
        <Input
          label="Hasta"
          type="date"
          value={hasta}
          min={desde || undefined}
          onChange={(e) => setHasta(e.target.value)}
        />
      </Card>

      {!rangoValido ? (
        <EmptyState
          icon={<History />}
          title="Revisá las fechas"
          description="La fecha final no puede ser anterior a la inicial."
        />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <Skeleton className="h-72" />
      ) : (
        <DataTable
          caption="Clases dictadas"
          columns={columnas}
          rows={ordenadas}
          getRowKey={(c) => c.id}
          empty={
            <EmptyState
              icon={<History />}
              title="No diste clases en este rango de fechas"
            />
          }
        />
      )}
    </div>
  );
}