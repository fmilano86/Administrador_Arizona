import { useState, type ReactNode } from "react";

import { Alert, Button, Modal } from "@/components/common";
import { CupoIndicator } from "@/components/ui/CupoIndicator";
import { useCancelarTurno, useReservarTurno } from "@/hooks/useTurnos";
import { toast } from "@/store/toastStore";
import type { ClaseDetalle } from "@/types";
import { claseStatus, nombreCompleto } from "@/utils/claseUtils";
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

// Confirmar una reserva nueva (o anotarse en lista de espera si está completa),
// o, si ya tiene un turno, ver el detalle y poder cancelarlo / salir de la espera.
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
  const enEspera = turno?.estado === "EN_ESPERA";
  const claseLlena = !turno && !!clase && claseStatus(clase) === "COMPLETA";
  const puedeCancelar = !!clase && !!turno && !yaComenzo(clase.inicio);

  const confirmarReserva = async () => {
    if (!clase) return;
    setError(null);
    try {
      const turnoCreado = await reservar.mutateAsync(clase.id);
      if (turnoCreado.estado === "EN_ESPERA") {
        toast.success(
          "Te anotamos en la lista de espera",
          `${clase.actividad.nombre} · ${formatDiaLargo(clase.inicio)}, ${formatHora(clase.inicio)}`,
        );
      } else {
        toast.success(
          "Reserva confirmada",
          `${clase.actividad.nombre} · ${formatDiaLargo(clase.inicio)}, ${formatHora(clase.inicio)}`,
        );
      }
      cerrar();
    } catch (e) {
      setError(getErrorMessage(e, "No pudimos completar la reserva."));
    }
  };

  const cancelarReserva = async () => {
    if (!turno) return;
    setError(null);
    try {
      await cancelar.mutateAsync(turno.id);
      toast.success(
        enEspera ? "Saliste de la lista de espera" : "Reserva cancelada",
        enEspera
          ? "Ya no estás anotado/a para esta clase."
          : "El lugar quedó disponible para otras personas.",
      );
      cerrar();
    } catch (e) {
      setError(getErrorMessage(e, "No pudimos cancelar."));
    }
  };

  return (
    <Modal
      open={!!clase}
      onClose={cerrar}
      size="sm"
      title={
        turno
          ? enEspera
            ? "Estás en lista de espera"
            : "Tu reserva"
          : claseLlena
            ? "Anotarte en lista de espera"
            : "Confirmá tu reserva"
      }
      description={
        turno
          ? enEspera
            ? "Si se libera un lugar, vas a pasar a confirmada automáticamente, en el orden en que te anotaste."
            : "Ya tenés un lugar en esta clase."
          : claseLlena
            ? "No quedan lugares, pero podés anotarte: si alguien cancela, el primero de la lista pasa a tener su reserva confirmada."
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
                  {enEspera ? "Salir de la lista de espera" : "Cancelar reserva"}
                </Button>
              )
            ) : (
              <Button onClick={confirmarReserva} loading={reservar.isPending}>
                {claseLlena ? "Anotarme en lista de espera" : "Confirmar reserva"}
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
            {clase.en_espera > 0 && (
              <Fila label="En lista de espera">
                {clase.en_espera} persona{clase.en_espera === 1 ? "" : "s"}
              </Fila>
            )}
          </dl>
          {error && <Alert tone="error">{error}</Alert>}
        </div>
      )}
    </Modal>
  );
}