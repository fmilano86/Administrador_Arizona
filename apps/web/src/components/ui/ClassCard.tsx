import { CalendarCheck, UserRound } from "lucide-react";

import { Badge, Button } from "@/components/common";
import { cn } from "@/lib/cn";
import type { ClaseDetalle } from "@/types";
import {
  claseStatus,
  nombreCompleto,
  sePuedeReservar,
} from "@/utils/claseUtils";
import { rangoHorario } from "@/utils/dateUtils";

import { ClaseStatusBadge } from "./ClaseStatusBadge";
import { CupoIndicator } from "./CupoIndicator";

interface ClassCardProps {
  clase: ClaseDetalle;
  onReservar?: (clase: ClaseDetalle) => void;
  /** Compacta: pensada para las columnas angostas de la grilla semanal. */
  compact?: boolean;
}

export function ClassCard({
  clase,
  onReservar,
  compact = false,
}: ClassCardProps) {
  const status = claseStatus(clase);
  const apagada = status === "FINALIZADA" || status === "CANCELADA";
  const reservada = !!clase.mi_turno;

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-2xl border bg-papel p-4 transition-colors",
        reservada
          ? "border-oliva-500 ring-1 ring-oliva-500/30"
          : "border-oliva-200",
        apagada && "opacity-60",
      )}
    >
      <div
        className={cn(
          "flex gap-2",
          compact
            ? "flex-col items-start"
            : "flex-wrap items-center justify-between",
        )}
      >
        <p className="text-sm font-semibold text-oliva-900 tabular-nums">
          {rangoHorario(clase.inicio, clase.fin)}
        </p>
        {reservada ? (
          <Badge tone="success" dot>
            Reservada
          </Badge>
        ) : (
          <ClaseStatusBadge clase={clase} />
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-display text-base leading-snug font-semibold">
          {clase.actividad.nombre}
        </h3>
        <p className="flex items-center gap-1.5 text-sm text-oliva-700">
          <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{nombreCompleto(clase.profesor)}</span>
        </p>
      </div>

      <CupoIndicator
        ocupados={clase.turnos_confirmados}
        total={clase.cupo_maximo}
      />

      {onReservar && !apagada && (
        <Button
          size="sm"
          variant={reservada ? "ghost" : "primary"}
          disabled={!reservada && !sePuedeReservar(clase)}
          onClick={() => onReservar(clase)}
          leftIcon={
            reservada ? <CalendarCheck className="size-4" /> : undefined
          }
          className={cn(compact && "w-full")}
        >
          {reservada
            ? "Ver reserva"
            : status === "COMPLETA"
              ? "Sin lugares"
              : status === "EN_CURSO"
                ? "En curso"
                : "Reservar"}
        </Button>
      )}
    </article>
  );
}
