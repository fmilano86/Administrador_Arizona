import { api } from "@/lib/axios";
import type { BloqueClase, BloqueCreado, BloqueInput } from "@/types";

export const listBloques = () =>
  api.get<BloqueClase[]>("/bloques").then((r) => r.data);

// Crea el bloque y genera sus clases (una por semana entre fecha_desde y fecha_hasta).
export const crearBloque = (input: BloqueInput) =>
  api.post<BloqueCreado>("/bloques", input).then((r) => r.data);

export const cancelarBloque = (id: number) =>
  api.patch<BloqueClase>(`/bloques/${id}/cancelar`).then((r) => r.data);
