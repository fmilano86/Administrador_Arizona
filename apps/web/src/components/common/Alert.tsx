import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info } from "lucide-react";

import { cn } from "@/lib/cn";

interface AlertProps {
  tone?: "error" | "success" | "info";
  children: ReactNode;
  className?: string;
}

const styles = {
  error: "border-rose-300 bg-rose-50 text-rose-900",
  success: "border-lime-300 bg-lime-50 text-lime-900",
  info: "border-oliva-200 bg-oliva-50 text-oliva-800",
};
const icons = { error: CircleAlert, success: CircleCheck, info: Info };

export function Alert({ tone = "info", children, className }: AlertProps) {
  const Icon = icons[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm",
        styles[tone],
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
