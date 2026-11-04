import { z } from "zod";

import {
  correo,
  fechaNacimientoOpcional,
  requerido,
  telefonoOpcional,
} from "./common";

export const loginSchema = z.object({
  email: correo,
  password: z.string().min(1, "Ingresá tu contraseña"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    nombre: requerido("Ingresá tu nombre"),
    apellido: requerido("Ingresá tu apellido"),
    email: correo,
    telefono: telefonoOpcional,
    fecha_nacimiento: fechaNacimientoOpcional,
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Repetí tu contraseña"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;
