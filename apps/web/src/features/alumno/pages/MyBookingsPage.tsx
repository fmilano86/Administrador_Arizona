import { useState } from "react";
import { CalendarX2, UserRound } from "lucide-react";
import { Link } from "react-router";

import {
  Badge,
  Button,
  buttonStyles,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeader,
  SegmentedControl,
  Skeleton,
} from "@/components/common";
import { useCancelarTurno } from "@/hooks/useTurnos";
import { toast } from "@/store/toastStore";
import type { TurnoDetalle } from "@/types";
import { nombreCompleto } from "@/utils/claseUtils";
import {
  formatDiaLargo,
  formatDiaMes,
  parseISO,
  rangoHorario,
  yaComenzo,
} from "@/utils/dateUtils";
import { getErrorMessage } from "@/utils/errorUtils";

import { useMyBookings } from "../hooks/useMyBookings";

type Vista = "proximas" | "historial";

function estadoDelTurno(t: TurnoDetalle) {
  if (t.estado === "CANCELADO")
    return { label: "Cancelada", tone: "danger" as const };
  if (t.clase.estado === "CANCELADA")
    return { label: "Clase cancelada", tone: "danger" as const };
  if (yaComenzo(t.clase.inicio) && new Date() > parseISO(t.clase.fin))
    return { label: "Realizada", tone: "neutral" as const };
  return { label: "Confirmada", tone: "success" as const };
}

function ReservaItem({
  turno,
  onCancelar,
}: {
  turno: TurnoDetalle;
  onCancelar?: (t: TurnoDetalle) => void;
}) {
  const { clase } = turno;
  const estado = estadoDelTurno(turno);
  const inicio = parseISO(clase.inicio);
  const puedeCancelar =
    !!onCancelar && turno.estado === "CONFIRMADO" && !yaComenzo(clase.inicio);

  return (
    <li>
      <Card className="flex items-center gap-4 p-4 sm:p-5">
        <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-oliva-100 text-oliva-800">
          <span className="font-display text-xl leading-none font-semibold tabular-nums">
            {inicio.getDate()}
          </span>
          <span className="mt-0.5 text-xs">
            {formatDiaMes(inicio).split(" ")[1]}
          </span>
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="font-display font-semibold">
              {clase.actividad.nombre}
            </h3>
            <Badge tone={estado.tone}>{estado.label}</Badge>
          </div>
          <p className="text-sm text-oliva-700">
            {formatDiaLargo(clase.inicio)} ·{" "}
            {rangoHorario(clase.inicio, clase.fin)}
          </p>
          <p className="flex items-center gap-1.5 text-sm text-oliva-600">
            <UserRound className="size-3.5" aria-hidden="true" />
            {nombreCompleto(clase.profesor)}
          </p>
        </div>
        {puedeCancelar && (
          <Button variant="danger" size="sm" onClick={() => onCancelar(turno)}>
            Cancelar
          </Button>
        )}
      </Card>
    </li>
  );
}

export default function MyBookingsPage() {
  const [vista, setVista] = useState<Vista>("proximas");
  const [aCancelar, setACancelar] = useState<TurnoDetalle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reservas = useMyBookings();
  const cancelar = useCancelarTurno();

  const lista = vista === "proximas" ? reservas.proximos : reservas.historial;

  const cerrar = () => {
    setACancelar(null);
    setError(null);
  };

  const confirmarCancelacion = async () => {
    if (!aCancelar) return;
    try {
      await cancelar.mutateAsync(aCancelar.id);
      toast.success(
        "Reserva cancelada",
        "El lugar quedó disponible para otras personas.",
      );
      cerrar();
    } catch (e) {
      setError(getErrorMessage(e, "No pudimos cancelar la reserva."));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis reservas"
        subtitle="Tus clases confirmadas y tu historial."
      />

      <SegmentedControl
        label="Tipo de reservas"
        value={vista}
        onChange={setVista}
        options={[
          { value: "proximas", label: "Próximas" },
          { value: "historial", label: "Historial" },
        ]}
      />

      {reservas.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : reservas.isError ? (
        <ErrorState error={reservas.error} onRetry={reservas.refetch} />
      ) : lista.length === 0 ? (
        <EmptyState
          icon={<CalendarX2 />}
          title={
            vista === "proximas"
              ? "No tenés clases reservadas"
              : "Todavía no tenés historial"
          }
          description={
            vista === "proximas"
              ? "Cuando reserves una clase, la vas a ver acá."
              : "Tus clases pasadas y canceladas van a aparecer acá."
          }
          action={
            vista === "proximas" && (
              <Link
                to="/alumno/clases"
                className={buttonStyles({ variant: "primary" })}
              >
                Ver clases disponibles
              </Link>
            )
          }
        />
      ) : (
        <ul className="space-y-3">
          {lista.map((t) => (
            <ReservaItem
              key={t.id}
              turno={t}
              onCancelar={vista === "proximas" ? setACancelar : undefined}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!aCancelar}
        onClose={cerrar}
        onConfirm={confirmarCancelacion}
        loading={cancelar.isPending}
        error={error}
        tone="danger"
        title="¿Cancelar esta reserva?"
        description={
          aCancelar
            ? `${aCancelar.clase.actividad.nombre} · ${formatDiaLargo(aCancelar.clase.inicio)}, ${rangoHorario(aCancelar.clase.inicio, aCancelar.clase.fin)}`
            : undefined
        }
        confirmLabel="Cancelar reserva"
        cancelLabel="Mantener reserva"
      >
        <p className="text-sm text-oliva-700">
          Tu lugar quedará libre para otras personas.
        </p>
      </ConfirmDialog>
    </div>
  );
}
