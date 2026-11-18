import { Button, Card, Input, Select } from "@/components/common";
import { toApiDate } from "@/utils/dateUtils";

export interface ProfesorFiltros {
  desde: string;
  hasta: string;
  hora: string;
}

// Filtros de turnos del profesor: por fecha y por horario. Solo permite buscar desde hoy en adelante.
export function ClassFilterBar({
  value,
  horarios,
  onChange,
  onReset,
}: {
  value: ProfesorFiltros;
  horarios: string[];
  onChange: (value: ProfesorFiltros) => void;
  onReset: () => void;
}) {
  const hoy = toApiDate(new Date());

  return (
    <Card className="p-4 sm:p-5">
      <form
        onSubmit={(e) => e.preventDefault()}
        aria-label="Filtrar turnos"
        className="grid items-end gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto]"
      >
        <Input
          label="Desde"
          type="date"
          value={value.desde}
          min={hoy}
          max={value.hasta || undefined}
          onChange={(e) => onChange({ ...value, desde: e.target.value })}
        />
        <Input
          label="Hasta"
          type="date"
          value={value.hasta}
          min={value.desde || hoy}
          onChange={(e) => onChange({ ...value, hasta: e.target.value })}
        />
        <Select
          label="Horario"
          value={value.hora}
          onChange={(e) => onChange({ ...value, hora: e.target.value })}
          className="sm:col-span-2 md:col-span-1"
        >
          <option value="">Todos los horarios</option>
          {horarios.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </Select>
        <Button
          variant="ghost"
          onClick={onReset}
          className="sm:col-span-2 md:col-span-3 lg:col-span-1"
        >
          Restablecer
        </Button>
      </form>
    </Card>
  );
}