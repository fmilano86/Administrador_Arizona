import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center px-6 py-12 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-oliva-100 text-oliva-600 [&>svg]:size-6">
          {icon}
        </div>
      )}
      <h3>{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-oliva-700">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
