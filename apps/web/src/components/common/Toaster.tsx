import { CircleAlert, CircleCheck, Info, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { useToastStore, type ToastTone } from "@/store/toastStore";

const icons: Record<ToastTone, typeof Info> = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
};
const iconColor: Record<ToastTone, string> = {
  success: "text-lime-700",
  error: "text-rose-700",
  info: "text-oliva-600",
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-20 z-60 flex flex-col items-center gap-2 md:right-6 md:bottom-6 md:left-auto md:items-end"
    >
      {toasts.map((t) => {
        const Icon = icons[t.tone];
        return (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className="animate-pop pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-oliva-200 bg-papel p-4 shadow-soft"
          >
            <Icon
              className={cn("mt-0.5 size-5 shrink-0", iconColor[t.tone])}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-oliva-900">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-sm text-oliva-700">{t.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Cerrar aviso"
              className="-m-1 inline-flex size-7 items-center justify-center rounded-full text-oliva-500 hover:bg-oliva-100"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
