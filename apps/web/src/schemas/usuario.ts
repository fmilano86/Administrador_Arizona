import { z } from "zod";

import {
  correo,
  dniOpcional,
  fechaNacimientoOpcional,
  requerido,
  telefonoOpcional,
} from "./common";

// Al crear, la contraseña inicial es obligatoria; al editar no se pide.
export const usuarioSchema = (modo: "crear" | "editar") =>
  z.object({
    nombre: requerido("Ingresá el nombre"),
    apellido: requerido("Ingresá el apellido"),
    email: correo,
    telefono: telefonoOpcional,
    dni: dniOpcional,
    fecha_nacimiento: fechaNacimientoOpcional,
    password:
      modo === "crear"
        ? z
            .string()
            .min(8, "La contraseña inicial debe tener al menos 8 caracteres")
        : z.string(),
  });
export type UsuarioFormValues = z.infer<ReturnType<typeof usuarioSchema>>;
