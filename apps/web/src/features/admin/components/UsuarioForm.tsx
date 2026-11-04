import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, Button, Input } from "@/components/common";
import { useGuardarUsuario } from "@/hooks/useUsuarios";
import { usuarioSchema, type UsuarioFormValues } from "@/schemas/usuario";
import { toast } from "@/store/toastStore";
import type { Rol, Usuario } from "@/types";
import { getErrorMessage } from "@/utils/errorUtils";

// Alta y edición de alumnos y profesores (mismos campos, distinto rol).
export function UsuarioForm({
  rol,
  usuario,
  onClose,
}: {
  rol: Extract<Rol, "ALUMNO" | "PROFESOR">;
  usuario?: Usuario;
  onClose: () => void;
}) {
  const modo = usuario ? "editar" : "crear";
  const guardar = useGuardarUsuario();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema(modo)),
    defaultValues: {
      nombre: usuario?.nombre ?? "",
      apellido: usuario?.apellido ?? "",
      email: usuario?.email ?? "",
      telefono: usuario?.telefono ?? "",
      dni: usuario?.dni ?? "",
      fecha_nacimiento: usuario?.fecha_nacimiento ?? "",
      password: "",
    },
  });

  const etiqueta = rol === "ALUMNO" ? "Alumno" : "Profesor";

  const onSubmit = handleSubmit(async (v) => {
    setError(null);
    try {
      await guardar.mutateAsync({
        id: usuario?.id,
        input: {
          rol,
          nombre: v.nombre.trim(),
          apellido: v.apellido.trim(),
          email: v.email,
          telefono: v.telefono.trim() || null,
          dni: v.dni.trim() || null,
          fecha_nacimiento: v.fecha_nacimiento || null,
          ...(modo === "crear" ? { password: v.password } : {}),
        },
      });
      toast.success(
        modo === "crear" ? `${etiqueta} creado` : `${etiqueta} actualizado`,
        `${v.nombre.trim()} ${v.apellido.trim()}`,
      );
      onClose();
    } catch (e) {
      setError(getErrorMessage(e, "No pudimos guardar los datos."));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Nombre"
          required
          error={errors.nombre?.message}
          {...register("nombre")}
        />
        <Input
          label="Apellido"
          required
          error={errors.apellido?.message}
          {...register("apellido")}
        />
      </div>
      <Input
        label="Correo electrónico"
        type="email"
        required
        error={errors.email?.message}
        {...register("email")}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Teléfono"
          type="tel"
          error={errors.telefono?.message}
          {...register("telefono")}
        />
        <Input
          label="DNI"
          inputMode="numeric"
          error={errors.dni?.message}
          {...register("dni")}
        />
      </div>
      <Input
        label="Fecha de nacimiento"
        type="date"
        error={errors.fecha_nacimiento?.message}
        {...register("fecha_nacimiento")}
      />
      {modo === "crear" && (
        <Input
          label="Contraseña inicial"
          type="text"
          autoComplete="off"
          required
          hint={`La persona la usa para ingresar la primera vez.`}
          error={errors.password?.message}
          {...register("password")}
        />
      )}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={guardar.isPending}>
          {modo === "crear"
            ? `Crear ${etiqueta.toLowerCase()}`
            : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
