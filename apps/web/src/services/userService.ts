import { api } from "@/lib/axios";
import type { Rol, Usuario, UsuarioInput } from "@/types";

export const listUsuarios = (rol: Rol) =>
  api.get<Usuario[]>("/usuarios", { params: { rol } }).then((r) => r.data);

export const crearUsuario = (input: UsuarioInput) =>
  api.post<Usuario>("/usuarios", input).then((r) => r.data);

export const actualizarUsuario = (id: number, input: Partial<UsuarioInput>) =>
  api.patch<Usuario>(`/usuarios/${id}`, input).then((r) => r.data);

// Baja lógica (alumnos) o quita/restablece el acceso (profesores).
export const cambiarEstadoUsuario = (id: number, activo: boolean) =>
  api
    .patch<Usuario>(`/usuarios/${id}`, {
      eliminado_en: activo ? null : new Date().toISOString(),
    })
    .then((r) => r.data);
