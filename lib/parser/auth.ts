import { timingSafeEqual } from "crypto";
import {
  getParserCredentials,
  getParserSessionSecret,
} from "@/lib/parser/config";

function safeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) {
    if (bufA.length > 0) {
      timingSafeEqual(bufA, bufA);
    }
    return false;
  }

  return timingSafeEqual(bufA, bufB);
}

/**
 * Validates credentials against server env only.
 * Never import this module from client components.
 */
export function validateParserCredentials(
  inputLogin: string,
  inputPassword: string
): boolean {
  const credentials = getParserCredentials();
  const secret = getParserSessionSecret();

  if (!credentials || !secret) return false;

  const login = inputLogin.trim();
  const password = inputPassword;

  return (
    safeStringEqual(login, credentials.login) &&
    safeStringEqual(password, credentials.password)
  );
}
