import { NextResponse } from "next/server";
import { parserSessionCookieOptions } from "@/lib/parser/session";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    ...parserSessionCookieOptions,
    value: "",
    maxAge: 0,
  });
  return response;
}
