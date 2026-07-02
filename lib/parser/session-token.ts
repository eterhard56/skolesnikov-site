import { createHmac, timingSafeEqual } from "crypto";
import { getParserSessionSecret, PARSER_SESSION_MAX_AGE } from "@/lib/parser/config";

type SessionPayload = {
  sub: "parser";
  iat: number;
  exp: number;
};

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

function base64UrlDecode(input: string): Buffer {
  const pad = "=".repeat((4 - (input.length % 4)) % 4);
  return Buffer.from(input + pad, "base64url");
}

function signData(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function createSessionToken(): string | null {
  const secret = getParserSessionSecret();
  if (!secret) return null;

  const now = Date.now();
  const payload: SessionPayload = {
    sub: "parser",
    iat: now,
    exp: now + PARSER_SESSION_MAX_AGE * 1000,
  };
  const data = base64UrlEncode(JSON.stringify(payload));
  const signature = signData(data, secret);
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string): boolean {
  const secret = getParserSessionSecret();
  if (!secret) return false;

  const [data, signature] = token.split(".");
  if (!data || !signature) return false;

  const expected = signData(data, secret);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return false;

  try {
    const payload = JSON.parse(
      base64UrlDecode(data).toString("utf8")
    ) as SessionPayload;
    return payload.sub === "parser" && payload.exp > Date.now();
  } catch {
    return false;
  }
}
