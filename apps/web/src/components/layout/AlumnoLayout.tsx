import {
  CalendarCheck,
  CalendarDays,
  House,
  LogOut,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Link, NavLink, Outlet } from "react-router";

import { Avatar, Logo } from "@/components/common";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/store/authStore";

const items: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/alumno/inicio", label: "Inicio", icon: House },
  { to: "/alumno/clases", label: "Clases", icon: CalendarDays },
  { to: "/alumno/reservas", label: "Mis reservas", icon: CalendarCheck },
  { to: "/alumno/perfil", label: "Perfil", icon: UserRound },
];

export function AlumnoLayout() {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useLogout();
  if (!usuario) return null;

  return (
    <div className="min-h-dvh pb-24 md:pb-0">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-70 focus:rounded-full focus:bg-papel focus:px-4 focus:py-2 focus:text-sm focus:shadow-soft"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-30 border-b border-oliva-200/70 bg-marfil/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link
            to="/alumno/inicio"
            aria-label="Arizona Health & Studio, ir al inicio"
          >
            <Logo tono="oliva" className="h-9" />
          </Link>

          <nav aria-label="Principal" className="ml-6 hidden gap-1 md:flex">
            {items.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-oliva-500 text-marfil"
                      : "text-oliva-800 hover:bg-oliva-100",
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link to="/alumno/perfil" aria-label="Mi perfil">
              <Avatar nombre={usuario.nombre} apellido={usuario.apellido} />
            </Link>
            <button
              type="button"
              onClick={logout}
              aria-label="Cerrar sesión"
              className="hidden size-10 items-center justify-center rounded-full text-oliva-700 hover:bg-oliva-100 md:inline-flex"
            >
              <LogOut className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main
        id="contenido"
        className="mx-auto max-w-6xl px-4 pt-6 pb-10 sm:px-6 sm:pt-8"
      >
        <Outlet />
      </main>

      {/* Barra inferior en celulares, como en la app */}
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-oliva-200 bg-papel pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 py-2.5 text-xs font-medium",
                isActive ? "text-oliva-600" : "text-oliva-500",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "flex h-7 w-12 items-center justify-center rounded-full",
                    isActive && "bg-oliva-100",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
