import { useState } from "react";
import { CalendarCheck, Gauge, Ticket, Users, UsersRound } from "lucide-react";

import {
  Avatar,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Skeleton,
} from "@/components/common";
import { BarChart } from "@/components/ui/BarChart";
import { ClaseStatusBadge } from "@/components/ui/ClaseStatusBadge";
import { ClassRosterModal } from "@/components/ui/ClassRosterModal";
import { CupoIndicator } from "@/components/ui/CupoIndicator";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { OccupancyDonut } from "@/components/ui/OccupancyDonut";
import { StatCard } from "@/components/ui/StatCard";
import { useAuthStore } from "@/store/authStore";
import type { ClaseDetalle } from "@/types";
import { nombreCompleto } from "@/utils/claseUtils";
import { formatDiaMes, formatHora } from "@/utils/dateUtils";

import { useDashboardData } from "../hooks/useDashboardData";

export default function DashboardPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const d = useDashboardData();
  const [seleccionada, setSeleccionada] = useState<ClaseDetalle | null>(null);

  const columnas: Column<ClaseDetalle>[] = [
    {
      key: "hora",
      header: "Hora",
      className: "font-medium tabular-nums",
      cell: (c) => formatHora(c.inicio),
    },
    { key: "clase", header: "Clase", cell: (c) => c.actividad.nombre },
    {
      key: "profesor",
      header: "Profesor/a",
      hideOnMobile: true,
      cell: (c) => nombreCompleto(c.profesor),
    },
    {
      key: "lugares",
      header: "Lugares",
      cell: (c) => (
        <CupoIndicator ocupados={c.turnos_confirmados} total={c.cupo_maximo} />
      ),
    },
    {
      key: "estado",
      header: "Estado",
      cell: (c) => <ClaseStatusBadge clase={c} />,
    },
    {
      key: "acciones",
      header: <span className="sr-only">Acciones</span>,
      className: "text-right",
      cell: (c) => (
        <Button variant="ghost" size="sm" onClick={() => setSeleccionada(c)}>
          Ver alumnos
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1>Hola, {usuario?.nombre}</h1>
        <p className="text-oliva-700">Así viene la actividad del estudio.</p>
      </div>

      {d.isError ? (
        <ErrorState error={d.error} onRetry={d.refetch} />
      ) : d.isLoading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-72" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<CalendarCheck />}
              label="Clases de hoy"
              value={d.deHoy.length}
            />
            <StatCard
              icon={<Ticket />}
              label="Reservas de hoy"
              value={d.ocupadosHoy}
              tone="terracota"
            />
            <StatCard
              icon={<Gauge />}
              label="Ocupación de hoy"
              value={`${d.ocupacionHoy}%`}
            />
            <StatCard
              icon={<Users />}
              label="Alumnos activos"
              value={d.alumnosActivos}
              tone="terracota"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <section
              aria-labelledby="agenda-hoy"
              className="space-y-3 xl:col-span-2"
            >
              <h2 id="agenda-hoy" className="text-h3 font-semibold">
                Agenda de hoy
              </h2>
              <DataTable
                caption="Clases de hoy"
                columns={columnas}
                rows={d.deHoy}
                getRowKey={(c) => c.id}
                empty={
                  <Card>
                    <EmptyState
                      title="Hoy no hay clases programadas"
                      description="Podés crear nuevos horarios desde la sección Horarios."
                    />
                  </Card>
                }
              />
            </section>

            <div className="space-y-6">
              <Card className="space-y-4 p-6">
                <h2 className="text-h3 font-semibold">
                  Ocupación de la semana
                </h2>
                <OccupancyDonut
                  ocupados={d.ocupadosSemana}
                  total={d.cupoSemana}
                />
              </Card>
              <Card className="space-y-4 p-6">
                <h2 className="text-h3 font-semibold">Reservas por día</h2>
                <BarChart
                  data={d.reservasPorDia}
                  ariaLabel="Reservas por día de esta semana"
                />
              </Card>
            </div>
          </div>

          <section aria-labelledby="recientes">
            <Card className="p-6">
              <h2 id="recientes" className="text-h3 font-semibold">
                Alumnos recientes
              </h2>
              {d.recientes.length === 0 ? (
                <EmptyState
                  icon={<UsersRound />}
                  title="Todavía no hay alumnos"
                />
              ) : (
                <ul className="mt-3 divide-y divide-oliva-100">
                  {d.recientes.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 py-3">
                      <Avatar
                        nombre={a.nombre}
                        apellido={a.apellido}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {nombreCompleto(a)}
                        </p>
                        <p className="truncate text-xs text-oliva-600">
                          {a.email}
                        </p>
                      </div>
                      <p className="text-xs text-oliva-600">
                        Alta el {formatDiaMes(a.fecha_alta)}
                      </p>
                    </li>
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
