import { cn } from "@/lib/cn";

// Estilos compartidos por input, select y textarea.
export const controlStyles = (hasError: boolean) =>
  cn(
    "w-full rounded-xl border bg-papel px-3.5 text-sm text-oliva-900 transition-colors",
    "placeholder:text-oliva-400 hover:border-oliva-400",
    "focus:border-oliva-500 focus:outline-none focus:ring-2 focus:ring-oliva-500/25",
    "disabled:bg-oliva-50 disabled:text-oliva-500",
    hasError ? "border-rose-600 hover:border-rose-600" : "border-oliva-300",
  );
