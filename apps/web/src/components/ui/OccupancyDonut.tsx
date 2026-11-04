// Porcentaje de lugares ocupados sobre el total.
export function OccupancyDonut({
  ocupados,
  total,
}: {
  ocupados: number;
  total: number;
}) {
  const radio = 42;
  const circunferencia = 2 * Math.PI * radio;
  const porcentaje = total > 0 ? Math.round((ocupados / total) * 100) : 0;
  const lleno = (porcentaje / 100) * circunferencia;

  return (
    <div className="flex items-center gap-6">
      <div className="relative size-36 shrink-0">
        <svg
          viewBox="0 0 100 100"
          className="size-full -rotate-90"
          role="img"
          aria-label={`Ocupación: ${porcentaje}%`}
        >
          <circle
            cx="50"
            cy="50"
            r={radio}
            fill="none"
            stroke="var(--color-oliva-100)"
            strokeWidth="12"
          />
          <circle
            cx="50"
            cy="50"
            r={radio}
            fill="none"
            stroke="var(--color-oliva-500)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${lleno} ${circunferencia}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-semibold tabular-nums">
            {porcentaje}%
          </span>
          <span className="text-xs text-oliva-600">ocupación</span>
        </div>
      </div>
      <dl className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-3 rounded-full bg-oliva-500"
          />
          <dt className="text-oliva-700">Ocupados</dt>
          <dd className="ml-auto pl-4 font-semibold tabular-nums">
            {ocupados}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-3 rounded-full bg-oliva-100 ring-1 ring-oliva-300"
          />
          <dt className="text-oliva-700">Libres</dt>
          <dd className="ml-auto pl-4 font-semibold tabular-nums">
            {Math.max(total - ocupados, 0)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
