import { Navigate } from "react-router";

import { useAuthStore, useIsAuthenticated } from "@/store/authStore";
import { homeForRole } from "@/utils/roleUtils";

export function HomeRedirect() {
  const autenticado = useIsAuthenticated();
  const usuario = useAuthStore((s) => s.usuario);
  if (autenticado && usuario)
    return <Navigate to={homeForRole(usuario.rol)} replace />;
  return <Navigate to="/login" replace />;
}
