import { z } from "zod";

export const actividadSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "Ingresá el nombre de la actividad")
    .max(80, "Máximo 80 caracteres"),
  descripcion: z.string().trim().max(300, "Máximo 300 caracteres"),
});
export type ActividadFormValues = z.infer<typeof actividadSchema>;
