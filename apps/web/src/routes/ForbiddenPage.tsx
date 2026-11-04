import { ShieldAlert } from "lucide-react";
import { Link } from "react-router";

import { buttonStyles, EmptyState } from "@/components/common";
import { useAuthStore } from "@/store/authStore";
import { homeForRole } from "@/utils/roleUtils";

export default function ForbiddenPage() {
  const rol = useAuthStore((s) => s.usuario?.rol);
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <EmptyState
        icon={<ShieldAlert />}
        title="No tenés acceso a esta sección"
        description="Tu cuenta no tiene permisos para ver esta página."
        action={
          <Link
            to={rol ? homeForRole(rol) : "/login"}
            className={buttonStyles({ variant: "dark" })}
          >
            Volver al inicio
          </Link>
        }
      />
    </div>
  );
}
