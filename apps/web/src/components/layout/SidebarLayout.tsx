import { useEffect, useState } from "react";
import { LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { NavLink, Outlet } from "react-router";

import { Avatar, Logo } from "@/components/common";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/store/authStore";
import { formatFechaCompleta } from "@/utils/dateUtils";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarLayoutProps {
  items: NavItem[];
  variant: "dark" | "light";
  roleLabel: string;
}

export function SidebarLayout({
  items,
  variant,
  roleLabel,
}: SidebarLayoutProps) {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const dark = variant === "dark";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!usuario) return null;

  return (
    <div className="min-h-dvh lg:pl-64">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-70 focus:rounded-full focus:bg-papel focus:px-4 focus:py-2 focus:text-sm focus:shadow-soft"
      >
        Saltar al contenido
      </a>

      {open && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-oliva-900/50 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 flex-col lg:flex",
          open ? "animate-pop flex" : "hidden",
          dark
            ? "bg-oliva-500 text-marfil"
            : "border-r border-oliva-200 bg-papel text-oliva-900",
        )}
      >
        <div className="flex h-20 items-center justify-between px-6">
          <Logo tono={dark ? "marfil" : "oliva"} className="h-11" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full lg:hidden",
              dark ? "hover:bg-marfil/15" : "hover:bg-oliva-100",
            )}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav
          aria-label="Principal"
          className="flex-1 space-y-1 overflow-y-auto px-3 py-2"
        >
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex h-11 items-center gap-3 rounded-full px-4 text-sm font-medium transition-colors",
                  dark
                    ? isActive
                      ? "bg-marfil text-oliva-800"
                      : "text-marfil/90 hover:bg-marfil/15"
                    : isActive
                      ? "bg-oliva-500 text-marfil"
                      : "text-oliva-800 hover:bg-oliva-100",
                )
              }
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div
          className={cn(
            "border-t p-3",
            dark ? "border-marfil/20" : "border-oliva-200",
          )}
        >
          <button
            type="button"
            onClick={logout}
            className={cn(
              "flex h-11 w-full items-center gap-3 rounded-full px-4 text-sm font-medium transition-colors",
              dark
                ? "text-marfil/90 hover:bg-marfil/15"
                : "text-oliva-800 hover:bg-oliva-100",
            )}
          >
            <LogOut className="size-5 shrink-0" aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-oliva-200/70 bg-marfil/90 px-4 backdrop-blur sm:px-8">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="inline-flex size-10 items-center justify-center rounded-full text-oliva-800 hover:bg-oliva-100 lg:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
        <p className="hidden text-sm text-oliva-700 sm:block">
          {formatFechaCompleta(new Date())}
        </p>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm leading-tight font-medium">
              {usuario.nombre} {usuario.apellido}
            </p>
            <p className="text-xs text-oliva-600">{roleLabel}</p>
          </div>
          <Avatar nombre={usuario.nombre} apellido={usuario.apellido} />
        </div>
      </header>

      <main
        id="contenido"
        className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-8 sm:pt-8"
      >
        <Outlet />
      </main>
    </div>
  );
}
