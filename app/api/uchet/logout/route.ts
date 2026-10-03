import { NextResponse } from "next/server";
import { uchetSessionCookieOptions } from "@/lib/uchet/session";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    ...uchetSessionCookieOptions,
    value: "",
    maxAge: 0,
  });
  return response;
}
