import { Outlet } from "react-router";

import { useAuthStore } from "@/store/authStore";
import type { Rol } from "@/types";
import { hasRole } from "@/utils/roleUtils";

import ForbiddenPage from "./ForbiddenPage";

// Restringe un grupo de rutas a ciertos roles. Va dentro de <ProtectedRoute />.
export function RoleGuard({ roles }: { roles: readonly Rol[] }) {
  const rol = useAuthStore((s) => s.usuario?.rol);
  if (!hasRole(rol, roles)) return <ForbiddenPage />;
  return <Outlet />;
}
