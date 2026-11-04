import { useMemo, useState } from "react";
import { CalendarSearch } from "lucide-react";
import { Link } from "react-router";

import { EmptyState, ErrorState, Skeleton } from "@/components/common";
import { ClassCard } from "@/components/ui/ClassCard";
import { WeekStrip } from "@/components/ui/WeekStrip";
import { useClases } from "@/hooks/useClases";
import { useAuthStore } from "@/store/authStore";
import type { ClaseDetalle } from "@/types";
import {
  addDays,
  formatDiaLargo,
  isSameDay,
  parseISO,
  startOfDay,
  toApiDate,
} from "@/utils/dateUtils";

import { BookingConfirmModal } from "../components/BookingConfirmModal";
import { NextClassCard } from "../components/NextClassCard";
import { useMyBookings } from "../hooks/useMyBookings";

export default function AlumnoInicioPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const hoy = useMemo(() => startOfDay(new Date()), []);
  const dias = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(hoy, i)),
    [hoy],
  );
  const [dia, setDia] = useState(hoy);
  const [seleccionada, setSeleccionada] = useState<ClaseDetalle | null>(null);

  const clases = useClases({
    desde: toApiDate(dias[0]),
    hasta: toApiDate(dias[6]),
  });
  const reservas = useMyBookings();

  const marcados = useMemo(
    () =>
      new Set(
        (clases.data ?? [])
          .filter((c) => c.estado === "PROGRAMADA")
          .map((c) => c.inicio.slice(0, 10)),
      ),
    [clases.data],
  );
  const delDia = (clases.data ?? []).filter(
    (c) => isSameDay(parseISO(c.inicio), dia) && c.estado !== "CANCELADA",
  );

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1>Hola, {usuario?.nombre}</h1>
        <p className="text-oliva-700">Qué bueno verte por acá.</p>
      </div>

      {reservas.isLoading ? (
        <Skeleton className="h-52 rounded-3xl" />
      ) : (
        <NextClassCard turno={reservas.proximos[0]} />
      )}

      <section aria-labelledby="titulo-semana" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 id="titulo-semana">Clases de la semana</h2>
          <Link
            to="/alumno/clases"
            className="text-sm font-medium text-terracota-700 underline underline-offset-4"
          >
            Ver todas
          </Link>
        </div>

        <WeekStrip
          days={dias}
          selected={dia}
          onSelect={setDia}
          marked={marcados}
          label="Próximos 7 días"
        />

        <h3 className="pt-2 text-oliva-800">{formatDiaLargo(dia)}</h3>

        {clases.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : clases.isError ? (
          <ErrorState error={clases.error} onRetry={clases.refetch} />
        ) : delDia.length === 0 ? (
          <EmptyState
            icon={<CalendarSearch />}
            title="No hay clases este día"
            description="Probá con otro día de la semana."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {delDia.map((c) => (
              <ClassCard key={c.id} clase={c} onReservar={setSeleccionada} />
            ))}
          </div>
        )}
      </section>

      <BookingConfirmModal
        clase={seleccionada}
        onClose={() => setSeleccionada(null)}
      />
    </div>
  );
}
