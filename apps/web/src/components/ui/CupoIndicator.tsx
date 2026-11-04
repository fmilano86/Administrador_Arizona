import { cn } from "@/lib/cn";

// Un punto por lugar de la clase (máx. 7). Los ocupados van llenos; si la clase está completa, todos pasan a terracota.
export function CupoIndicator({
  ocupados,
  total,
  className,
  showCount = true,
}: {
  ocupados: number;
  total: number;
  className?: string;
  showCount?: boolean;
}) {
  const completa = ocupados >= total;
  return (
    <div
      role="img"
      aria-label={`${ocupados} de ${total} lugares ocupados`}
      className={cn("flex items-center gap-2", className)}
    >
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              "size-2.5 rounded-full border",
              i < ocupados
                ? completa
                  ? "border-terracota-500 bg-terracota-500"
                  : "border-oliva-500 bg-oliva-500"
                : "border-oliva-300 bg-transparent",
            )}
          />
        ))}
      </div>
      {showCount && (
        <span
          className="text-xs font-medium text-oliva-700 tabular-nums"
          aria-hidden="true"
        >
          {ocupados}/{total}
        </span>
      )}
    </div>
  );
}
