import { cn } from "@/lib/cn";

const palettes = [
  "bg-oliva-200 text-oliva-900",
  "bg-terracota-200 text-terracota-900",
  "bg-oliva-100 text-oliva-800",
  "bg-terracota-100 text-terracota-800",
];

const sizes = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-xl",
};

export function Avatar({
  nombre,
  apellido,
  size = "md",
  className,
}: {
  nombre: string;
  apellido: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const iniciales = `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();
  const hash = [...(nombre + apellido)].reduce(
    (acc, c) => acc + c.charCodeAt(0),
    0,
  );
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        palettes[hash % palettes.length],
        sizes[size],
        className,
      )}
    >
      {iniciales}
    </span>
  );
}
