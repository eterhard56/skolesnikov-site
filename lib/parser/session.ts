import { cookies } from "next/headers";
import { PARSER_COOKIE_NAME } from "@/lib/parser/config";
import { verifySessionToken } from "@/lib/parser/session-token";

export { createSessionToken, verifySessionToken } from "@/lib/parser/session-token";

export async function getParserSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PARSER_COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

export const parserSessionCookieOptions = {
  name: PARSER_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
