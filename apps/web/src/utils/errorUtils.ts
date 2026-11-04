import { isAxiosError } from "axios";

import type { ApiErrorBody } from "@/types";

// Convierte cualquier error en un mensaje legible para mostrar en pantalla.
export function getErrorMessage(
  error: unknown,
  fallback = "Ocurrió un error inesperado. Probá de nuevo en unos minutos.",
): string {
  if (!isAxiosError<ApiErrorBody>(error)) return fallback;

  if (!error.response) {
    return "No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.";
  }

  const data = error.response.data;
  const detail = data?.detail;

  if (typeof detail === "string" && detail) return detail;
  if (Array.isArray(detail) && detail.length) {
    const primero = detail[0];
    const mensaje = primero?.msg ?? primero?.message;
    if (mensaje) return mensaje;
  }
  if (
    detail &&
    !Array.isArray(detail) &&
    typeof detail === "object" &&
    detail.message
  ) {
    return detail.message;
  }
  if (typeof data?.message === "string" && data.message) return data.message;

  if (error.response.status >= 500)
    return "El servidor tuvo un problema. Probá de nuevo en unos minutos.";
  return fallback;
}
