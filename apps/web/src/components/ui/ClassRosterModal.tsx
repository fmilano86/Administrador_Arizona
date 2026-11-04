import { Cake, Mail, Phone } from "lucide-react";

import {
  Avatar,
  EmptyState,
  ErrorState,
  Modal,
  Skeleton,
} from "@/components/common";
import { useTurnos } from "@/hooks/useTurnos";
import type { ClaseDetalle } from "@/types";
import { formatDiaLargo, formatDiaMes, rangoHorario } from "@/utils/dateUtils";

import { CupoIndicator } from "./CupoIndicator";

// Lista de alumnos inscriptos en una clase, con sus datos de contacto.
export function ClassRosterModal({
  clase,
  onClose,
}: {
  clase: ClaseDetalle | null;
  onClose: () => void;
}) {
  const { data, isLoading, isError, error, refetch } = useTurnos(
    { clase_id: clase?.id, estado: "CONFIRMADO" },
    { enabled: !!clase },
  );
  const turnos = data ?? [];

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
          ) : turnos.length === 0 ? (
            <EmptyState
              title="Todavía no hay alumnos inscriptos"
              description="Cuando alguien reserve esta clase, lo vas a ver acá."
            />
          ) : (
            <ul className="divide-y divide-oliva-100">
              {turnos.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3"
                >
                  <Avatar
                    nombre={t.alumno.nombre}
                    apellido={t.alumno.apellido}
                  />
                  <div className="min-w-40 flex-1">
                    <p className="font-medium">
                      {t.alumno.nombre} {t.alumno.apellido}
                    </p>
                    {t.tipo === "PRUEBA" && (
                      <p className="text-xs text-terracota-700">
                        Clase de prueba
                      </p>
                    )}
                  </div>
                  <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-oliva-700">
                    {t.alumno.telefono && (
                      <li className="flex items-center gap-1.5">
                        <Phone className="size-3.5" aria-hidden="true" />
                        {t.alumno.telefono}
                      </li>
                    )}
                    {t.alumno.email && (
                      <li className="flex items-center gap-1.5">
                        <Mail className="size-3.5" aria-hidden="true" />
                        {t.alumno.email}
                      </li>
                    )}
                    {t.alumno.fecha_nacimiento && (
                      <li className="flex items-center gap-1.5">
                        <Cake className="size-3.5" aria-hidden="true" />
                        {formatDiaMes(t.alumno.fecha_nacimiento)}
                      </li>
                    )}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
}
