import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  actualizarUsuario,
  cambiarEstadoUsuario,
  crearUsuario,
  listUsuarios,
} from "@/services/userService";
import type { Rol, UsuarioInput } from "@/types";

export const usuarioKeys = {
  all: ["usuarios"] as const,
  list: (rol: Rol) => ["usuarios", rol] as const,
};

export function useUsuarios(rol: Rol) {
  return useQuery({
    queryKey: usuarioKeys.list(rol),
    queryFn: async () => {
      const usuarios = await listUsuarios(rol);
      return [...usuarios].sort((a, b) =>
        a.apellido.localeCompare(b.apellido, "es"),
      );
    },
  });
}

export function useGuardarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: number; input: UsuarioInput }) =>
      id ? actualizarUsuario(id, input) : crearUsuario(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: usuarioKeys.all }),
  });
}

export function useCambiarEstadoUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      cambiarEstadoUsuario(id, activo),
    onSuccess: () => qc.invalidateQueries({ queryKey: usuarioKeys.all }),
  });
}
