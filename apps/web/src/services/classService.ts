import { api } from "@/lib/axios";
import type { ClaseDetalle, ClaseFiltros } from "@/types";

export const listClases = (filtros: ClaseFiltros = {}) =>
  api.get<ClaseDetalle[]>("/clases", { params: filtros }).then((r) => r.data);

export const getClase = (id: number) =>
  api.get<ClaseDetalle>(`/clases/${id}`).then((r) => r.data);

export const cancelarClase = (id: number) =>
  api.patch<ClaseDetalle>(`/clases/${id}/cancelar`).then((r) => r.data);
