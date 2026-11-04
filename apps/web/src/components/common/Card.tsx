import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-oliva-200/80 bg-papel shadow-soft",
        className,
      )}
      {...props}
    />
  );
}
