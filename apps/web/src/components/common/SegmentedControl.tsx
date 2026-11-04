import { cn } from "@/lib/cn";

interface Option<T extends string> {
  value: T;
  label: string;
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex rounded-full border border-oliva-300 bg-papel p-1"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "h-9 rounded-full px-5 text-sm font-medium transition-colors",
            value === o.value
              ? "bg-oliva-500 text-marfil"
              : "text-oliva-700 hover:bg-oliva-100",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
