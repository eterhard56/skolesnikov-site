import { cookies } from "next/headers";
import { UCHET_COOKIE_NAME } from "@/lib/uchet/auth-config";
import { verifyUchetSessionToken } from "@/lib/uchet/session-token";

export {
  createUchetSessionToken,
  verifyUchetSessionToken,
} from "@/lib/uchet/session-token";

export async function getUchetSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(UCHET_COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyUchetSessionToken(token);
}

export const uchetSessionCookieOptions = {
  name: UCHET_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
