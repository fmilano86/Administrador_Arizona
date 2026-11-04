import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router";

import { useAuthStore, useIsAuthenticated } from "@/store/authStore";
import type { AuthResponse, Rol } from "@/types";
import { ROL_HOME } from "@/utils/constants";

import { login, register } from "../services/authService";

export function useAuth() {
  const usuario = useAuthStore((s) => s.usuario);
  const isAuthenticated = useIsAuthenticated();
  return { usuario, isAuthenticated, rol: usuario?.rol };
}

// Ruta a la que volver después de loguearse, solo si pertenece al área del rol.
function destinoPostLogin(rol: Rol, from: unknown) {
  const home = ROL_HOME[rol];
  const area = `/${home.split("/")[1]}`;
  return typeof from === "string" && from.startsWith(area) ? from : home;
}

function useGuardarSesion() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from
    ?.pathname;

  return (data: AuthResponse) => {
    setSession(data.access_token, data.usuario);
    navigate(destinoPostLogin(data.usuario.rol, from), { replace: true });
  };
}

export function useLogin() {
  const guardarSesion = useGuardarSesion();
  return useMutation({ mutationFn: login, onSuccess: guardarSesion });
}

export function useRegister() {
  const guardarSesion = useGuardarSesion();
  return useMutation({ mutationFn: register, onSuccess: guardarSesion });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  return () => {
    logout();
    navigate("/login", { replace: true });
  };
}
