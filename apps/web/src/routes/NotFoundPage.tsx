import { Compass } from "lucide-react";
import { Link } from "react-router";

import { buttonStyles, EmptyState } from "@/components/common";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <EmptyState
        icon={<Compass />}
        title="No encontramos esta página"
        description="Puede que el enlace esté mal escrito o que la página ya no exista."
        action={
          <Link to="/" className={buttonStyles({ variant: "dark" })}>
            Ir al inicio
          </Link>
        }
      />
    </div>
  );
}
