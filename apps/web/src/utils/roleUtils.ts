import type { Rol } from "@/types";

import { ROL_HOME } from "./constants";

export const homeForRole = (rol: Rol) => ROL_HOME[rol];

export const hasRole = (rol: Rol | undefined, permitidos: readonly Rol[]) =>
  !!rol && permitidos.includes(rol);
