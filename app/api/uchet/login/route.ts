import { NextResponse } from "next/server";
import {
  isUchetAuthConfigured,
  UCHET_SESSION_MAX_AGE,
} from "@/lib/uchet/auth-config";
import { validateUchetCredentials } from "@/lib/uchet/auth";
import {
  createUchetSessionToken,
  uchetSessionCookieOptions,
} from "@/lib/uchet/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isUchetAuthConfigured()) {
    return NextResponse.json(
      { error: "Сервис авторизации не настроен" },
      { status: 503 }
    );
  }

  let body: { login?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Некорректный запрос" },
      { status: 400 }
    );
  }

  const inputLogin = body.login?.trim() ?? "";
  const inputPassword = body.password ?? "";

  if (!inputLogin || !inputPassword) {
    return NextResponse.json(
      { error: "Введите логин и пароль" },
      { status: 400 }
    );
  }

  if (!validateUchetCredentials(inputLogin, inputPassword)) {
    return NextResponse.json(
      { error: "Неверный логин или пароль" },
      { status: 401 }
    );
  }

  const token = createUchetSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: "Сервис авторизации не настроен" },
      { status: 503 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    ...uchetSessionCookieOptions,
    value: token,
    maxAge: UCHET_SESSION_MAX_AGE,
  });
  return response;
}
