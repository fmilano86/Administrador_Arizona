import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

// Modal donde el navegador se encarga del foco, de Escape y de bloquear la interacción con el resto de la página. El contenido solo se monta mientras está abierto, así los formularios arrancan limpios.
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      className={cn(
        "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-3xl bg-papel p-0 text-oliva-900 shadow-2xl",
        "backdrop:bg-oliva-900/50 backdrop:backdrop-blur-[2px]",
        size === "sm" && "max-w-md",
        size === "md" && "max-w-lg",
        size === "lg" && "max-w-2xl",
      )}
    >
      {open && (
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 id={titleId}>{title}</h2>
              {description && (
                <p id={descId} className="text-sm text-oliva-700">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="-mt-1 -mr-2 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-oliva-600 transition-colors hover:bg-oliva-100"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6">{children}</div>
          {footer && (
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {footer}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
