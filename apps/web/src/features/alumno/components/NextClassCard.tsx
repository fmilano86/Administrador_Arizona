import { CalendarClock, UserRound } from "lucide-react";
import { Link } from "react-router";

import { buttonStyles, Card } from "@/components/common";
import type { TurnoDetalle } from "@/types";
import { nombreCompleto } from "@/utils/claseUtils";
import { formatDiaLargo, rangoHorario } from "@/utils/dateUtils";

// La próxima clase reservada: el elemento principal de la pantalla de inicio.
export function NextClassCard({ turno }: { turno?: TurnoDetalle }) {
  return (
    <Card className="relative overflow-hidden p-6 sm:p-8">
      <svg
        viewBox="0 0 160 120"
        aria-hidden="true"
        className="pointer-events-none absolute -top-px -right-px h-28 w-auto sm:h-36"
      >
        <path
          d="M160 0V105C120 112 80 95 70 60C60 28 85 8 105 0Z"
          fill="var(--color-terracota-500)"
        />
        <path
          d="M160 0V50C142 56 124 46 120 32C117 18 125 6 132 0Z"
          fill="var(--color-terracota-300)"
        />
      </svg>

      <div className="relative">
        <p className="text-sm text-oliva-700">Tu próxima clase</p>
        {turno ? (
          <>
            <h2 className="mt-1 text-h1">{turno.clase.actividad.nombre}</h2>
            <ul className="mt-4 space-y-2 text-oliva-800">
              <li className="flex items-center gap-2.5">
                <CalendarClock
                  className="size-4 text-oliva-500"
                  aria-hidden="true"
                />
                {formatDiaLargo(turno.clase.inicio)} ·{" "}
                {rangoHorario(turno.clase.inicio, turno.clase.fin)}
              </li>
              <li className="flex items-center gap-2.5">
                <UserRound
                  className="size-4 text-oliva-500"
                  aria-hidden="true"
                />
                {nombreCompleto(turno.clase.profesor)}
              </li>
            </ul>
          </>
        ) : (
          <>
            <h2 className="mt-1 text-h1">Todavía no reservaste</h2>
            <p className="mt-2 max-w-md text-oliva-700">
              Elegí una clase de la semana y reservá tu lugar en un par de
              pasos.
            </p>
          </>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/alumno/clases"
            className={buttonStyles({ variant: "primary" })}
          >
            {turno ? "Reservar otra clase" : "Reservar una clase"}
          </Link>
          {turno && (
            <Link
              to="/alumno/reservas"
              className={buttonStyles({ variant: "ghost" })}
            >
              Ver mis reservas
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
