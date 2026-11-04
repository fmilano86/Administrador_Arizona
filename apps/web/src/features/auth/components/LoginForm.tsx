import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, Button, Input } from "@/components/common";
import { loginSchema, type LoginFormValues } from "@/schemas/auth";
import { getErrorMessage } from "@/utils/errorUtils";

import { useLogin } from "../hooks/useAuth";

// Cuentas del mock: solo se muestran en desarrollo.
const CUENTAS_DEMO = [
  { label: "Alumna", email: "valentina.lopez@arizona.test" },
  { label: "Profesora", email: "laura.gomez@arizona.test" },
  { label: "Administradora", email: "marina.ferrer@arizona.test" },
];

export function LoginForm() {
  const [mostrar, setMostrar] = useState(false);
  const login = useLogin();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => login.mutate(values))}
      noValidate
      className="space-y-5"
    >
      {login.isError && (
        <Alert tone="error">
          {getErrorMessage(login.error, "No pudimos iniciar sesión.")}
        </Alert>
      )}

      <Input
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        leftIcon={<Mail />}
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Contraseña"
        type={mostrar ? "text" : "password"}
        autoComplete="current-password"
        leftIcon={<Lock />}
        error={errors.password?.message}
        rightSlot={
          <button
            type="button"
            onClick={() => setMostrar((v) => !v)}
            aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="inline-flex size-9 items-center justify-center rounded-full text-oliva-600 hover:bg-oliva-100"
          >
            {mostrar ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        }
        {...register("password")}
      />

      <Button type="submit" size="lg" fullWidth loading={login.isPending}>
        Ingresar
      </Button>

      {import.meta.env.DEV && (
        <details className="rounded-2xl border border-dashed border-oliva-300 px-4 py-3 text-sm">
          <summary className="cursor-pointer font-medium text-oliva-700">
            Cuentas de prueba (solo desarrollo)
          </summary>
          <p className="mt-2 text-oliva-600">Contraseña: Arizona123!</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CUENTAS_DEMO.map((c) => (
              <Button
                key={c.email}
                size="sm"
                variant="secondary"
                onClick={() => {
                  setValue("email", c.email, { shouldValidate: true });
                  setValue("password", "Arizona123!", { shouldValidate: true });
                }}
              >
                {c.label}
              </Button>
            ))}
          </div>
        </details>
      )}
    </form>
  );
}
