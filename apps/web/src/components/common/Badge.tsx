import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type BadgeTone = "success" | "warning" | "danger" | "neutral" | "accent";

const tones: Record<BadgeTone, string> = {
  success: "bg-lime-100 text-lime-900",
  warning: "bg-amber-100 text-amber-900",
  danger: "bg-rose-100 text-rose-900",
  neutral: "bg-oliva-100 text-oliva-800",
  accent: "bg-terracota-100 text-terracota-800",
};

export function Badge({
  tone = "neutral",
  dot = false,
  children,
  className,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {dot && (
        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}
