import { useState } from "react";
import { Ticket } from "lucide-react";

import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
} from "@/components/common";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { useActividades } from "@/hooks/useActividades";
import { useTurnos } from "@/hooks/useTurnos";
import { cn } from "@/lib/cn";
import type { TurnoDetalle } from "@/types";
import { nombreCompleto } from "@/utils/claseUtils";
import {
  addDays,
  formatDiaMes,
  formatFechaCorta,
  rangoHorario,
  startOfDay,
  toApiDate,
} from "@/utils/dateUtils";

import {
  BookingsFilterBar,
  type TurnosFiltros,
} from "../components/BookingsFilterBar";

const TAMANO_PAGINA = 25;

const filtrosIniciales = (): TurnosFiltros => {
  const hoy = startOfDay(new Date());
  return {
    desde: toApiDate(hoy),
    hasta: toApiDate(addDays(hoy, 7)),
    actividadId: "",
  };
};

// Todos los turnos reservados, con filtro por fecha y actividad.
export default function TurnosPage() {
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const [visibles, setVisibles] = useState(TAMANO_PAGINA);
  const actividades = useActividades();

  const rangoValido =
    !!filtros.desde && !!filtros.hasta && filtros.hasta >= filtros.desde;
  const turnos = useTurnos(
    {
      desde: filtros.desde,
      hasta: filtros.hasta,
      actividad_id: filtros.actividadId
        ? Number(filtros.actividadId)
        : undefined,
    },
    { enabled: rangoValido },
  );

  const cambiarFiltros = (nuevos: TurnosFiltros) => {
    setFiltros(nuevos);
    setVisibles(TAMANO_PAGINA);
  };

  const todos = turnos.data ?? [];
  const confirmados = todos.filter((t) => t.estado === "CONFIRMADO").length;
  const cancelados = todos.length - confirmados;

  const columnas: Column<TurnoDetalle>[] = [
    {
      key: "fecha",
      header: "Fecha",
      className: "whitespace-nowrap",
      cell: (t) => (
        <>
          <span className="font-medium">{formatDiaMes(t.clase.inicio)}</span>
          <span className="ml-2 text-xs text-oliva-600">
            {formatFechaCorta(t.clase.inicio)}
          </span>
        </>
      ),
    },
    {
      key: "horario",
      header: "Horario",
      className: "tabular-nums",
      cell: (t) => rangoHorario(t.clase.inicio, t.clase.fin),
    },
    {
      key: "actividad",
      header: "Actividad",
      cell: (t) => t.clase.actividad.nombre,
    },
    {
      key: "profesor",
      header: "Profesor/a",
      hideOnMobile: true,
      cell: (t) => nombreCompleto(t.clase.profesor),
    },
    {
      key: "alumno",
      header: "Alumno",
      cell: (t) => (
        <div>
          <p className="leading-tight font-medium">
            {nombreCompleto(t.alumno)}
          </p>
          {t.alumno.email && (
            <p className="text-xs text-oliva-600">{t.alumno.email}</p>
          )}
        </div>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      cell: (t) =>
        t.estado === "CONFIRMADO" ? (
          <Badge tone="success" dot>
            Confirmado
          </Badge>
        ) : (
          <Badge tone="danger">Cancelado</Badge>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Turnos" subtitle="Todas las reservas del estudio." />

      <BookingsFilterBar
        value={filtros}
        actividades={(actividades.data ?? []).filter((a) => !a.eliminado_en)}
        onChange={cambiarFiltros}
        onReset={() => cambiarFiltros(filtrosIniciales())}
      />

      {!rangoValido ? (
        <EmptyState
          icon={<Ticket />}
          title="Revisá las fechas"
          description="La fecha final no puede ser anterior a la inicial."
        />
      ) : turnos.isError ? (
        <ErrorState error={turnos.error} onRetry={turnos.refetch} />
      ) : turnos.isLoading ? (
        <Skeleton className="h-72" />
      ) : (
        <div
          className={cn(
            "space-y-3 transition-opacity",
            turnos.isPlaceholderData && "opacity-60",
          )}
        >
          <p className="text-sm text-oliva-700" aria-live="polite">
            {confirmados}{" "}
            {confirmados === 1 ? "reserva confirmada" : "reservas confirmadas"}
            {cancelados > 0 &&
              ` · ${cancelados} ${cancelados === 1 ? "cancelada" : "canceladas"}`}
          </p>
          <DataTable
            caption="Turnos reservados"
            columns={columnas}
            rows={todos.slice(0, visibles)}
            getRowKey={(t) => t.id}
            rowClassName={(t) =>
              t.estado === "CANCELADO" ? "opacity-60" : undefined
            }
            empty={
              <EmptyState
                icon={<Ticket />}
                title="No hay turnos con estos filtros"
                description="Probá con otro rango de fechas u otra actividad."
              />
            }
          />
          {todos.length > visibles && (
            <div className="flex justify-center pt-2">
              <Button
                variant="secondary"
                onClick={() => setVisibles((v) => v + TAMANO_PAGINA)}
              >
                Mostrar {Math.min(TAMANO_PAGINA, todos.length - visibles)} más
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
