import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarRange } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Alert, Button, Input, Select } from "@/components/common";
import { useActividades } from "@/hooks/useActividades";
import { useCrearBloque } from "@/hooks/useBloques";
import { useUsuarios } from "@/hooks/useUsuarios";
import { bloqueSchema, type BloqueFormValues } from "@/schemas/bloque";
import { toast } from "@/store/toastStore";
import { CUPO_MAXIMO } from "@/utils/constants";
import {
  nombreDiaSemana,
  ocurrenciasSemanales,
  toApiDate,
} from "@/utils/dateUtils";
import { getErrorMessage } from "@/utils/errorUtils";

// Crea un bloque de clases: una clase por semana, el mismo día y horario.
export function BloqueForm({ onClose }: { onClose: () => void }) {
  const actividades = useActividades();
  const profesores = useUsuarios("PROFESOR");
  const crear = useCrearBloque();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BloqueFormValues>({
    resolver: zodResolver(bloqueSchema),
    defaultValues: {
      actividad_id: "",
      profesor_id: "",
      fecha_desde: toApiDate(new Date()),
      fecha_hasta: "",
      hora_inicio: "",
      hora_fin: "",
      cupo_maximo: String(CUPO_MAXIMO),
    },
  });

  const [desde, hasta, horaInicio, horaFin] = useWatch({
    control,
    name: ["fecha_desde", "fecha_hasta", "hora_inicio", "hora_fin"],
  });
  const cantidad = desde && hasta ? ocurrenciasSemanales(desde, hasta) : 0;

  const onSubmit = handleSubmit(async (v) => {
    setError(null);
    try {
      const { clases_generadas } = await crear.mutateAsync({
        actividad_id: Number(v.actividad_id),
        profesor_id: Number(v.profesor_id),
        fecha_desde: v.fecha_desde,
        fecha_hasta: v.fecha_hasta,
        hora_inicio: v.hora_inicio,
        hora_fin: v.hora_fin,
        cupo_maximo: Number(v.cupo_maximo),
      });
      toast.success(
        "Horario creado",
        `Se generaron ${clases_generadas} ${clases_generadas === 1 ? "clase" : "clases"}.`,
      );
      onClose();
    } catch (e) {
      setError(getErrorMessage(e, "No pudimos crear el horario."));
    }
  });

  const actividadesActivas = (actividades.data ?? []).filter(
    (a) => !a.eliminado_en,
  );
  const profesoresActivos = (profesores.data ?? []).filter(
    (p) => !p.eliminado_en,
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          label="Actividad"
          required
          error={errors.actividad_id?.message}
          {...register("actividad_id")}
        >
          <option value="">Elegí una actividad</option>
          {actividadesActivas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </Select>
        <Select
          label="Profesor/a"
          required
          error={errors.profesor_id?.message}
          {...register("profesor_id")}
        >
          <option value="">Elegí un profesor</option>
          {profesoresActivos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} {p.apellido}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Primera clase"
          type="date"
          required
          error={errors.fecha_desde?.message}
          {...register("fecha_desde")}
        />
        <Input
          label="Se repite hasta"
          type="date"
          required
          error={errors.fecha_hasta?.message}
          {...register("fecha_hasta")}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Input
          label="Hora de inicio"
          type="time"
          required
          error={errors.hora_inicio?.message}
          {...register("hora_inicio")}
        />
        <Input
          label="Hora de fin"
          type="time"
          required
          error={errors.hora_fin?.message}
          {...register("hora_fin")}
        />
        <Input
          label="Cupo"
          type="number"
          min={1}
          max={CUPO_MAXIMO}
          required
          error={errors.cupo_maximo?.message}
          {...register("cupo_maximo")}
        />
      </div>

      {cantidad > 0 && (
        <div className="flex items-start gap-3 rounded-2xl bg-oliva-50 px-4 py-3 text-sm text-oliva-800">
          <CalendarRange
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <p>
            Se{" "}
            {cantidad === 1
              ? "va a crear 1 clase"
              : `van a crear ${cantidad} clases`}
            , todos los <strong>{nombreDiaSemana(desde)}s</strong>
            {horaInicio && horaFin ? ` de ${horaInicio} a ${horaFin}` : ""}.
          </p>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={crear.isPending}>
          Crear horario
        </Button>
      </div>
    </form>
  );
}
