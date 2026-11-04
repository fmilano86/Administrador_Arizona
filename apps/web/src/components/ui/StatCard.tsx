import type { ReactNode } from "react";

import { Card } from "@/components/common";
import { cn } from "@/lib/cn";

export function StatCard({
  icon,
  label,
  value,
  helper,
  tone = "oliva",
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  helper?: string;
  tone?: "oliva" | "terracota";
}) {
  return (
    <Card className="flex items-start gap-4 p-5">
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full [&>svg]:size-5",
          tone === "oliva"
            ? "bg-oliva-100 text-oliva-700"
            : "bg-terracota-100 text-terracota-700",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm text-oliva-700">{label}</p>
        <p className="font-display text-2xl leading-tight font-semibold tabular-nums">
          {value}
        </p>
        {helper && <p className="mt-0.5 text-xs text-oliva-600">{helper}</p>}
      </div>
    </Card>
  );
}
