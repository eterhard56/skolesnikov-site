export const UCHET_DASHBOARD_PATH = "/uchet";
export const UCHET_LOGIN_PATH = "/uchet/login";

export function isUchetRoute(pathname: string): boolean {
  return pathname === "/uchet" || pathname.startsWith("/uchet/");
}

export function isUchetApiRoute(pathname: string): boolean {
  return pathname === "/api/uchet" || pathname.startsWith("/api/uchet/");
}

export function isPublicUchetPage(pathname: string): boolean {
  return pathname === UCHET_LOGIN_PATH;
}

export function isPublicUchetApi(pathname: string, method: string): boolean {
  return pathname === "/api/uchet/login" && method === "POST";
}
