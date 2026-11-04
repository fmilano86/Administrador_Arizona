import { z } from "zod";

import { CUPO_MAXIMO } from "@/utils/constants";

export const bloqueSchema = z
  .object({
    actividad_id: z.string().min(1, "Elegí una actividad"),
    profesor_id: z.string().min(1, "Elegí un profesor"),
    fecha_desde: z.string().min(1, "Elegí la fecha de la primera clase"),
    fecha_hasta: z.string().min(1, "Elegí hasta qué fecha se repite"),
    hora_inicio: z.string().min(1, "Elegí la hora de inicio"),
    hora_fin: z.string().min(1, "Elegí la hora de fin"),
    cupo_maximo: z.string().refine((v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 1 && n <= CUPO_MAXIMO;
    }, `El cupo debe ser un número entre 1 y ${CUPO_MAXIMO}`),
  })
  .refine(
    (v) => !v.fecha_desde || !v.fecha_hasta || v.fecha_hasta >= v.fecha_desde,
    {
      message: "La fecha de fin no puede ser anterior a la de inicio",
      path: ["fecha_hasta"],
    },
  )
  .refine((v) => !v.hora_inicio || !v.hora_fin || v.hora_fin > v.hora_inicio, {
    message: "La hora de fin debe ser posterior a la de inicio",
    path: ["hora_fin"],
  });
export type BloqueFormValues = z.infer<typeof bloqueSchema>;
