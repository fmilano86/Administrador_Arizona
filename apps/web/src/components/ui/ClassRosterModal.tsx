import { Cake, Mail, Phone } from "lucide-react";

import {
  Avatar,
  EmptyState,
  ErrorState,
  Modal,
  Skeleton,
} from "@/components/common";
import { useTurnos } from "@/hooks/useTurnos";
import type { ClaseDetalle, TurnoDetalle } from "@/types";
import { formatDiaLargo, formatDiaMes, rangoHorario } from "@/utils/dateUtils";

import { CupoIndicator } from "./CupoIndicator";

function FilaAlumno({
  turno,
  posicion,
}: {
  turno: TurnoDetalle;
  posicion?: number;
}) {
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
      {posicion !== undefined && (
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-terracota-100 text-xs font-semibold text-terracota-700">
          {posicion}
        </span>
      )}
      <Avatar nombre={turno.alumno.nombre} apellido={turno.alumno.apellido} />
      <div className="min-w-40 flex-1">
        <p className="font-medium">
          {turno.alumno.nombre} {turno.alumno.apellido}
        </p>
        {turno.tipo === "PRUEBA" && (
          <p className="text-xs text-terracota-700">Clase de prueba</p>
        )}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-oliva-700">
        {turno.alumno.telefono && (
          <li className="flex items-center gap-1.5">
            <Phone className="size-3.5" aria-hidden="true" />
            {turno.alumno.telefono}
          </li>
        )}
        {turno.alumno.email && (
          <li className="flex items-center gap-1.5">
            <Mail className="size-3.5" aria-hidden="true" />
            {turno.alumno.email}
          </li>
        )}
        {turno.alumno.fecha_nacimiento && (
          <li className="flex items-center gap-1.5">
            <Cake className="size-3.5" aria-hidden="true" />
            {formatDiaMes(turno.alumno.fecha_nacimiento)}
          </li>
        )}
      </ul>
    </li>
  );
}

// Lista de alumnos inscriptos en una clase (confirmados y en lista de espera), con sus datos de contacto.
export function ClassRosterModal({
  clase,
  onClose,
}: {
  clase: ClaseDetalle | null;
  onClose: () => void;
}) {
  const { data, isLoading, isError, error, refetch } = useTurnos(
    { clase_id: clase?.id },
    { enabled: !!clase },
  );
  const todos = data ?? [];
  const confirmados = todos.filter((t) => t.estado === "CONFIRMADO");
  const enEspera = [...todos.filter((t) => t.estado === "EN_ESPERA")].sort(
    (a, b) => a.fecha_reserva.localeCompare(b.fecha_reserva),
  );

  return (
    <Modal
      open={!!clase}
      onClose={onClose}
      size="lg"
      title={clase ? clase.actividad.nombre : "Clase"}
      description={
        clase
          ? `${formatDiaLargo(clase.inicio)} · ${rangoHorario(clase.inicio, clase.fin)}`
          : undefined
      }
    >
      {clase && (
        <div className="space-y-5">
          <CupoIndicator
            ocupados={clase.turnos_confirmados}
            total={clase.cupo_maximo}
          />

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : isError ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : confirmados.length === 0 && enEspera.length === 0 ? (
            <EmptyState
              title="Todavía no hay alumnos inscriptos"
              description="Cuando alguien reserve esta clase, lo vas a ver acá."
            />
          ) : (
            <>
              {confirmados.length === 0 ? (
                <EmptyState
                  title="Todavía no hay alumnos confirmados"
                  description="Los primeros en reservar van a aparecer acá."
                />
              ) : (
                <ul className="divide-y divide-oliva-100">
                  {confirmados.map((t) => (
                    <FilaAlumno key={t.id} turno={t} />
                  ))}
                </ul>
              )}

              {enEspera.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-oliva-800">
                    En lista de espera ({enEspera.length})
                  </h3>
                  <ul className="divide-y divide-oliva-100 rounded-2xl border border-dashed border-oliva-300 px-3">
                    {enEspera.map((t, i) => (
                      <FilaAlumno key={t.id} turno={t} posicion={i + 1} />
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Modal>
  );
}