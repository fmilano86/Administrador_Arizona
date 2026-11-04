import { Navigate, Outlet, useLocation } from "react-router";

import { useIsAuthenticated } from "@/store/authStore";

// Solo deja pasar a usuarios con sesión vigente.
export function ProtectedRoute() {
  const autenticado = useIsAuthenticated();
  const location = useLocation();
  if (!autenticado)
    return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
