import { Button, Card, Input, Select } from "@/components/common";
import type { Actividad } from "@/types";

export interface TurnosFiltros {
  desde: string;
  hasta: string;
  actividadId: string;
}

// Filtros de turnos del administrador: por fecha y por actividad.
export function BookingsFilterBar({
  value,
  actividades,
  onChange,
  onReset,
}: {
  value: TurnosFiltros;
  actividades: Actividad[];
  onChange: (value: TurnosFiltros) => void;
  onReset: () => void;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <form
        onSubmit={(e) => e.preventDefault()}
        aria-label="Filtrar turnos"
        className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]"
      >
        <Input
          label="Desde"
          type="date"
          value={value.desde}
          max={value.hasta || undefined}
          onChange={(e) => onChange({ ...value, desde: e.target.value })}
        />
        <Input
          label="Hasta"
          type="date"
          value={value.hasta}
          min={value.desde || undefined}
          onChange={(e) => onChange({ ...value, hasta: e.target.value })}
        />
        <Select
          label="Actividad"
          value={value.actividadId}
          onChange={(e) => onChange({ ...value, actividadId: e.target.value })}
        >
          <option value="">Todas las actividades</option>
          {actividades.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </Select>
        <Button variant="ghost" onClick={onReset}>
          Restablecer
        </Button>
      </form>
    </Card>
  );
}
