import { Navigate, Outlet } from "react-router";

import { useAuthStore, useIsAuthenticated } from "@/store/authStore";
import { homeForRole } from "@/utils/roleUtils";

// Login y registro: si ya hay sesión, va directo al inicio del rol.
export function PublicOnlyRoute() {
  const autenticado = useIsAuthenticated();
  const usuario = useAuthStore((s) => s.usuario);
  if (autenticado && usuario)
    return <Navigate to={homeForRole(usuario.rol)} replace />;
  return <Outlet />;
}
