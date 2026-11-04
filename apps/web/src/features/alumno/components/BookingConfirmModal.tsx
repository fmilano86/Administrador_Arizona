import { useState, type ReactNode } from "react";

import { Alert, Button, Modal } from "@/components/common";
import { CupoIndicator } from "@/components/ui/CupoIndicator";
import { useCancelarTurno, useReservarTurno } from "@/hooks/useTurnos";
import { toast } from "@/store/toastStore";
import type { ClaseDetalle } from "@/types";
import { nombreCompleto } from "@/utils/claseUtils";
import {
  formatDiaLargo,
  formatHora,
  rangoHorario,
  yaComenzo,
} from "@/utils/dateUtils";
import { getErrorMessage } from "@/utils/errorUtils";

function Fila({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-sm text-oliva-700">{label}</dt>
      <dd className="text-right text-sm font-medium">{children}</dd>
    </div>
  );
}

// Confirmar una reserva nueva o, si la clase ya está reservada, ver el detalle y poder cancelarla.
export function BookingConfirmModal({
  clase,
  onClose,
}: {
  clase: ClaseDetalle | null;
  onClose: () => void;
}) {
  const reservar = useReservarTurno();
  const cancelar = useCancelarTurno();
  const [error, setError] = useState<string | null>(null);

  const cerrar = () => {
    setError(null);
    reservar.reset();
    cancelar.reset();
    onClose();
  };

  const turno = clase?.mi_turno ?? null;
  const puedeCancelar = !!clase && !!turno && !yaComenzo(clase.inicio);

  const confirmarReserva = async () => {
    if (!clase) return;
    setError(null);
    try {
      await reservar.mutateAsync(clase.id);
      toast.success(
        "Reserva confirmada",
        `${clase.actividad.nombre} · ${formatDiaLargo(clase.inicio)}, ${formatHora(clase.inicio)}`,
      );
      cerrar();
    } catch (e) {
      setError(getErrorMessage(e, "No pudimos confirmar la reserva."));
    }
  };

  const cancelarReserva = async () => {
    if (!turno) return;
    setError(null);
    try {
      await cancelar.mutateAsync(turno.id);
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
    <Modal
      open={!!clase}
      onClose={cerrar}
      size="sm"
      title={turno ? "Tu reserva" : "Confirmá tu reserva"}
      description={
        turno
          ? "Ya tenés un lugar en esta clase."
          : "Revisá los datos antes de confirmar."
      }
      footer={
        clase && (
          <>
            <Button variant="ghost" onClick={cerrar}>
              Volver
            </Button>
            {turno ? (
              puedeCancelar && (
                <Button
                  variant="danger"
                  onClick={cancelarReserva}
                  loading={cancelar.isPending}
                >
                  Cancelar reserva
                </Button>
              )
            ) : (
              <Button onClick={confirmarReserva} loading={reservar.isPending}>
                Confirmar reserva
              </Button>
            )}
          </>
        )
      }
    >
      {clase && (
        <div className="space-y-4">
          <dl className="divide-y divide-oliva-100 rounded-2xl border border-oliva-200 px-4">
            <Fila label="Clase">{clase.actividad.nombre}</Fila>
            <Fila label="Día">{formatDiaLargo(clase.inicio)}</Fila>
            <Fila label="Horario">{rangoHorario(clase.inicio, clase.fin)}</Fila>
            <Fila label="Profesor/a">{nombreCompleto(clase.profesor)}</Fila>
            <Fila label="Lugares">
              <CupoIndicator
                ocupados={clase.turnos_confirmados}
                total={clase.cupo_maximo}
              />
            </Fila>
          </dl>
          {error && <Alert tone="error">{error}</Alert>}
        </div>
      )}
    </Modal>
  );
}
