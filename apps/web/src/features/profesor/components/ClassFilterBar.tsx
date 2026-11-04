import { Button, Card, Input, Select } from "@/components/common";

export interface ProfesorFiltros {
  desde: string;
  hasta: string;
  hora: string;
}

// Filtros de turnos del profesor: por fecha y por horario.
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
          label="Horario"
          value={value.hora}
          onChange={(e) => onChange({ ...value, hora: e.target.value })}
        >
          <option value="">Todos los horarios</option>
          {horarios.map((h) => (
            <option key={h} value={h}>
              {h}
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
