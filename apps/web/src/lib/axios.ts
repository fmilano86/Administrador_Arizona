import axios, { type AxiosError } from "axios";

import { useAuthStore } from "@/store/authStore";

// Cliente HTTP único de la app. La URL base sale de VITE_API_URL: hoy apunta al mock (JSON Server), cuando esté el backend FastAPI alcanza con cambiar esa variable.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3001",
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// Adjunta el JWT en cada request.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el token venció o es inválido, cerramos la sesión (ProtectedRoute redirige al login).
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";
    const esAuth =
      url.startsWith("/auth/login") || url.startsWith("/auth/register");
    if (status === 401 && !esAuth) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);
