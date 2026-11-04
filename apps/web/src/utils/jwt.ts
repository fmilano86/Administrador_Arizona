interface JwtPayload {
  sub?: string;
  rol?: string;
  exp?: number;
}

// Decodifica el payload de un JWT (sin validar la firma: eso lo hace el backend).
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
    if (!base64) return null;
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const exp = decodeJwt(token)?.exp;
  if (!exp) return false; // si el token no trae `exp`, dejamos que decida el backend.
  return exp * 1000 <= Date.now();
}
