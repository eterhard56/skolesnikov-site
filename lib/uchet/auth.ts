import { timingSafeEqual } from "crypto";
import {
  getUchetCredentials,
  getUchetSessionSecret,
} from "@/lib/uchet/auth-config";

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

/** Server-only. Never import from client components. */
export function validateUchetCredentials(
  inputLogin: string,
  inputPassword: string
): boolean {
  const credentials = getUchetCredentials();
  const secret = getUchetSessionSecret();
  if (!credentials || !secret) return false;

  return (
    safeStringEqual(inputLogin.trim(), credentials.login) &&
    safeStringEqual(inputPassword, credentials.password)
  );
}
