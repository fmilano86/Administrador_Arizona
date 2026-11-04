import { cn } from "@/lib/cn";
import { formatDiaSemanaCorto, isSameDay, toApiDate } from "@/utils/dateUtils";

// Selector de día en formato tira.
export function WeekStrip({
  days,
  selected,
  onSelect,
  marked,
  label = "Elegí un día",
}: {
  days: Date[];
  selected: Date;
  onSelect: (day: Date) => void;
  marked?: Set<string>;
  label?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="grid grid-cols-7 gap-1.5 sm:gap-2"
    >
      {days.map((day) => {
        const activo = isSameDay(day, selected);
        const hoy = isSameDay(day, new Date());
        return (
          <button
            key={day.toISOString()}
            type="button"
            aria-pressed={activo}
            onClick={() => onSelect(day)}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-2xl border py-2.5 transition-colors",
              activo
                ? "border-oliva-500 bg-oliva-500 text-marfil"
                : "border-oliva-200 bg-papel text-oliva-800 hover:bg-oliva-100",
              hoy && !activo && "border-terracota-500",
            )}
          >
            <span className="text-xs">{formatDiaSemanaCorto(day)}</span>
            <span className="text-base font-semibold tabular-nums">
              {day.getDate()}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 rounded-full",
                marked?.has(toApiDate(day))
                  ? activo
                    ? "bg-marfil"
                    : "bg-terracota-500"
                  : "bg-transparent",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
