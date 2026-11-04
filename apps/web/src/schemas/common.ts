import { z } from "zod";

// Validaciones de formularios con Zod. Candidatas a moverse a `packages/shared` para reutilizarlas en mobile.
export const requerido = (mensaje: string) => z.string().trim().min(1, mensaje);

export const correo = z
  .string()
  .trim()
  .min(1, "Ingresá tu correo electrónico")
  .pipe(z.email("El correo electrónico no es válido"));

/** Teléfono opcional: dígitos, espacios, +, ( ) y guiones. */
export const telefonoOpcional = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || /^[0-9+()\s-]{8,20}$/.test(v),
    "Ingresá un teléfono válido",
  );

/** Fecha de nacimiento opcional (yyyy-MM-dd), no futura. */
export const fechaNacimientoOpcional = z
  .string()
  .refine(
    (v) => v === "" || !Number.isNaN(Date.parse(v)),
    "Ingresá una fecha válida",
  )
  .refine(
    (v) => v === "" || new Date(v) <= new Date(),
    "La fecha de nacimiento no puede ser futura",
  );

export const dniOpcional = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || /^[0-9]{7,9}$/.test(v),
    "El DNI debe tener entre 7 y 9 números",
  );
