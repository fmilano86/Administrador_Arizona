import { Cake, IdCard, LogOut, Mail, Phone } from "lucide-react";
import type { ReactNode } from "react";

import { Avatar, Badge, Button, Card, PageHeader } from "@/components/common";
import { useAuthStore } from "@/store/authStore";
import { ROL_LABEL } from "@/utils/constants";
import { formatFechaCorta } from "@/utils/dateUtils";

import { useLogout } from "../hooks/useAuth";

function Dato({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-oliva-500 [&>svg]:size-4">{icon}</span>
      <div>
        <dt className="text-xs text-oliva-600">{label}</dt>
        <dd className="text-sm font-medium">{value || "Sin completar"}</dd>
      </div>
    </div>
  );
}

// Perfil de solo lectura, compartido por los tres roles.
export default function PerfilPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useLogout();
  if (!usuario) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Mi perfil" />
      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <Avatar
            nombre={usuario.nombre}
            apellido={usuario.apellido}
            size="lg"
          />
          <div className="space-y-1.5">
            <h2>
              {usuario.nombre} {usuario.apellido}
            </h2>
            <Badge tone="neutral">{ROL_LABEL[usuario.rol]}</Badge>
          </div>
        </div>

        <dl className="mt-8 grid gap-5 sm:grid-cols-2">
          <Dato
            icon={<Mail />}
            label="Correo electrónico"
            value={usuario.email}
          />
          <Dato icon={<Phone />} label="Teléfono" value={usuario.telefono} />
          <Dato
            icon={<Cake />}
            label="Fecha de nacimiento"
            value={
              usuario.fecha_nacimiento
                ? formatFechaCorta(usuario.fecha_nacimiento)
                : null
            }
          />
          <Dato icon={<IdCard />} label="DNI" value={usuario.dni} />
        </dl>

        <p className="mt-6 text-sm text-oliva-600">
          Si necesitás cambiar algún dato, escribile al estudio.
        </p>

        <div className="mt-8 border-t border-oliva-100 pt-6">
          <Button
            variant="secondary"
            onClick={logout}
            leftIcon={<LogOut className="size-4" />}
          >
            Cerrar sesión
          </Button>
        </div>
      </Card>
    </div>
  );
}
