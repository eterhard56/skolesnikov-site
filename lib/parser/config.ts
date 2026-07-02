export const PARSER_COOKIE_NAME = "parser_session";

/** 7 days */
export const PARSER_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

/** Max businesses returned from a Yandex Maps search */
export const YANDEX_MAX_RESULTS = 15;

/** Per-request timeout for Yandex Maps HTML fetch */
export const YANDEX_FETCH_TIMEOUT_MS = 8_000;

/** Server-side search cache TTL */
export const PARSER_SEARCH_CACHE_TTL_MS = 10 * 60 * 1000;

export type ParserCredentials = {
  login: string;
  password: string;
};

export function getParserCredentials(): ParserCredentials | null {
  const login = process.env.PARSER_LOGIN?.trim();
  const password = process.env.PARSER_PASSWORD;

  if (!login || !password) return null;

  return { login, password };
}

export function getParserSessionSecret(): string | null {
  const secret = process.env.PARSER_SESSION_SECRET?.trim();
  if (!secret || secret.length < 32) return null;
  return secret;
}

export function isParserAuthConfigured(): boolean {
  return Boolean(getParserCredentials() && getParserSessionSecret());
}
