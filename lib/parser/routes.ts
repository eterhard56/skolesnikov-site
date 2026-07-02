export const PARSER_LOGIN_PATH = "/parser/login";
export const PARSER_DASHBOARD_PATH = "/parser";

export const PUBLIC_PARSER_PAGE_PATHS = [PARSER_LOGIN_PATH] as const;

export const PUBLIC_PARSER_API_PATHS = ["/api/parser/login"] as const;

export function isPublicParserPage(pathname: string): boolean {
  return PUBLIC_PARSER_PAGE_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function isPublicParserApi(pathname: string, method: string): boolean {
  if (method !== "POST") return false;
  return PUBLIC_PARSER_API_PATHS.includes(
    pathname as (typeof PUBLIC_PARSER_API_PATHS)[number]
  );
}

export function isParserRoute(pathname: string): boolean {
  return pathname.startsWith("/parser");
}

export function isParserApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/parser");
}
