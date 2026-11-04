import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, Button, Input, Textarea } from "@/components/common";
import { useGuardarActividad } from "@/hooks/useActividades";
import { actividadSchema, type ActividadFormValues } from "@/schemas/actividad";
import { toast } from "@/store/toastStore";
import type { Actividad } from "@/types";
import { getErrorMessage } from "@/utils/errorUtils";

export function ActivityForm({
  actividad,
  onClose,
}: {
  actividad?: Actividad;
  onClose: () => void;
}) {
  const guardar = useGuardarActividad();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActividadFormValues>({
    resolver: zodResolver(actividadSchema),
    defaultValues: {
      nombre: actividad?.nombre ?? "",
      descripcion: actividad?.descripcion ?? "",
    },
  });

  const onSubmit = handleSubmit(async (v) => {
    setError(null);
    try {
      await guardar.mutateAsync({
        id: actividad?.id,
        input: {
          nombre: v.nombre.trim(),
          descripcion: v.descripcion.trim() || null,
        },
      });
      toast.success(
        actividad ? "Actividad actualizada" : "Actividad creada",
        v.nombre.trim(),
      );
      onClose();
    } catch (e) {
      setError(getErrorMessage(e, "No pudimos guardar la actividad."));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {error && <Alert tone="error">{error}</Alert>}
      <Input
        label="Nombre"
        required
        error={errors.nombre?.message}
        {...register("nombre")}
      />
      <Textarea
        label="Descripción (opcional)"
        hint="Se muestra a los alumnos y al equipo."
        error={errors.descripcion?.message}
        {...register("descripcion")}
      />
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={guardar.isPending}>
          {actividad ? "Guardar cambios" : "Crear actividad"}
        </Button>
      </div>
    </form>
  );
}
