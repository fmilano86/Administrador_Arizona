import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "dark"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface StyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

// Clases del botón. Se exporta para dar aspecto de botón a <Link>.
export function buttonStyles({
  variant = "primary",
  size = "md",
  fullWidth = false,
}: StyleOptions = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-50",
    size === "sm" && "h-9 px-4 text-sm",
    size === "md" && "h-11 px-6 text-sm",
    size === "lg" && "h-12 px-8 text-base",
    variant === "primary" &&
      "bg-terracota-600 text-marfil hover:bg-terracota-700 active:bg-terracota-800",
    variant === "secondary" &&
      "border border-terracota-600 bg-transparent text-terracota-700 hover:bg-terracota-100",
    variant === "dark" &&
      "bg-oliva-500 text-marfil hover:bg-oliva-600 active:bg-oliva-700",
    variant === "ghost" && "text-oliva-700 hover:bg-oliva-100",
    variant === "danger" &&
      "border border-rose-700 bg-transparent text-rose-800 hover:bg-rose-50",
    fullWidth && "w-full",
  );
}
