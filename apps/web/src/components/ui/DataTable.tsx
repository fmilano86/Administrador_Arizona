import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  caption: string;
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string | number;
  empty?: ReactNode;
  rowClassName?: (row: T) => string | undefined;
}

export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowKey,
  empty,
  rowClassName,
}: DataTableProps<T>) {
  if (rows.length === 0 && empty) return <>{empty}</>;

  return (
    <div className="overflow-x-auto rounded-2xl border border-oliva-200 bg-papel">
      <table className="w-full min-w-max text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-oliva-50 text-xs font-medium text-oliva-700">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cn(
                  "px-4 py-3 font-medium whitespace-nowrap",
                  c.hideOnMobile && "hidden md:table-cell",
                  c.className,
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-oliva-100">
          {rows.map((row) => (
            <tr
              key={getRowKey(row)}
              className={cn(
                "align-middle hover:bg-oliva-50/60",
                rowClassName?.(row),
              )}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "px-4 py-3",
                    c.hideOnMobile && "hidden md:table-cell",
                    c.className,
                  )}
                >
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
