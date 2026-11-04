import { cn } from "@/lib/cn";

export interface BarDatum {
  label: string;
  value: number;
  highlight?: boolean;
}

// Gráfico de barras simple en HTML/CSS.
export function BarChart({
  data,
  ariaLabel,
}: {
  data: BarDatum[];
  ariaLabel: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div
      role="img"
      aria-label={`${ariaLabel}: ${data.map((d) => `${d.label} ${d.value}`).join(", ")}`}
    >
      <div className="flex h-40 items-end gap-2" aria-hidden="true">
        {data.map((d) => (
          <div
            key={d.label}
            className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
          >
            <span className="text-xs font-medium text-oliva-700 tabular-nums">
              {d.value}
            </span>
            <div
              className={cn(
                "w-full max-w-10 rounded-t-lg",
                d.highlight ? "bg-terracota-500" : "bg-oliva-400",
              )}
              style={{
                height: `${Math.max((d.value / max) * 100, d.value > 0 ? 4 : 0)}%`,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2" aria-hidden="true">
        {data.map((d) => (
          <span
            key={d.label}
            className="flex-1 text-center text-xs text-oliva-600"
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
