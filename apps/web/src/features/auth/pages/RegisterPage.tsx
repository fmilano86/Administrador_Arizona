import { Link } from "react-router";

import { AuthLayout } from "@/components/layout";

import { RegisterForm } from "../components/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Completá tus datos para empezar a reservar clases."
      footer={
        <>
          ¿Ya tenés cuenta?{" "}
          <Link
            to="/login"
            className="font-medium text-terracota-700 underline underline-offset-4"
          >
            Ingresá
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}
