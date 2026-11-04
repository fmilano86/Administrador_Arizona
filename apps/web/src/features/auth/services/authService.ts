import { api } from "@/lib/axios";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  Usuario,
} from "@/types";

export const login = (payload: LoginPayload) =>
  api.post<AuthResponse>("/auth/login", payload).then((r) => r.data);

export const register = (payload: RegisterPayload) =>
  api.post<AuthResponse>("/auth/register", payload).then((r) => r.data);

export const getMe = () => api.get<Usuario>("/auth/me").then((r) => r.data);
