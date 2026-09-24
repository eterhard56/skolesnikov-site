export const UCHET_COOKIE_NAME = "uchet_session";

/** 30 days */
export const UCHET_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export type UchetCredentials = {
  login: string;
  password: string;
};

export function getUchetCredentials(): UchetCredentials | null {
  const login = process.env.UCHET_LOGIN?.trim();
  const password = process.env.UCHET_PASSWORD;

  if (!login || !password) return null;
  return { login, password };
}

export function getUchetSessionSecret(): string | null {
  const secret = process.env.UCHET_SESSION_SECRET?.trim();
  if (!secret || secret.length < 32) return null;
  return secret;
}

export function isUchetAuthConfigured(): boolean {
  return Boolean(getUchetCredentials() && getUchetSessionSecret());
}
