import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Alert, Button, Input } from "@/components/common";
import { registerSchema, type RegisterFormValues } from "@/schemas/auth";
import { getErrorMessage } from "@/utils/errorUtils";

import { useRegister } from "../hooks/useAuth";

export function RegisterForm() {
  const registrar = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      fecha_nacimiento: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit((v) =>
    registrar.mutate({
      nombre: v.nombre.trim(),
      apellido: v.apellido.trim(),
      email: v.email,
      password: v.password,
      telefono: v.telefono.trim() || undefined,
      fecha_nacimiento: v.fecha_nacimiento || undefined,
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {registrar.isError && (
        <Alert tone="error">
          {getErrorMessage(registrar.error, "No pudimos crear tu cuenta.")}
        </Alert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Nombre"
          autoComplete="given-name"
          error={errors.nombre?.message}
          {...register("nombre")}
        />
        <Input
          label="Apellido"
          autoComplete="family-name"
          error={errors.apellido?.message}
          {...register("apellido")}
        />
      </div>

      <Input
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Teléfono (opcional)"
          type="tel"
          autoComplete="tel"
          error={errors.telefono?.message}
          {...register("telefono")}
        />
        <Input
          label="Fecha de nacimiento (opcional)"
          type="date"
          autoComplete="bday"
          error={errors.fecha_nacimiento?.message}
          {...register("fecha_nacimiento")}
        />
      </div>

      <Input
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        hint="Mínimo 8 caracteres."
        error={errors.password?.message}
        {...register("password")}
      />
      <Input
        label="Repetir contraseña"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button type="submit" size="lg" fullWidth loading={registrar.isPending}>
        Crear cuenta
      </Button>
    </form>
  );
}
