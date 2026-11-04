import { create } from "zustand";
import { persist } from "zustand/middleware";

import { queryClient } from "@/lib/queryClient";
import type { Usuario } from "@/types";
import { isTokenExpired } from "@/utils/jwt";

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  setSession: (token: string, usuario: Usuario) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      setSession: (token, usuario) => set({ token, usuario }),
      logout: () => {
        set({ token: null, usuario: null });
        queryClient.clear(); // no deja datos de la sesión anterior en caché
      },
    }),
    {
      name: "arizona-auth",
      partialize: (state) => ({ token: state.token, usuario: state.usuario }),
    },
  ),
);

// ¿Hay una sesión vigente? (token presente y no vencido).
export const useIsAuthenticated = () =>
  useAuthStore((s) => !!s.token && !!s.usuario && !isTokenExpired(s.token));
