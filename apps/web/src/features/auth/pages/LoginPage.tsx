import { Link } from "react-router";

import { AuthLayout } from "@/components/layout";

import { LoginForm } from "../components/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Ingresá a tu cuenta"
      subtitle="Reservá tus clases y seguí tus turnos."
      footer={
        <>
          ¿Todavía no tenés cuenta?{" "}
          <Link
            to="/registro"
            className="font-medium text-terracota-700 underline underline-offset-4"
          >
            Registrate
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
