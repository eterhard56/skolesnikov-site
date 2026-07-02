import { NextResponse } from "next/server";
import {
  isParserAuthConfigured,
  PARSER_SESSION_MAX_AGE,
} from "@/lib/parser/config";
import { validateParserCredentials } from "@/lib/parser/auth";
import {
  createSessionToken,
  parserSessionCookieOptions,
} from "@/lib/parser/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isParserAuthConfigured()) {
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

  if (!validateParserCredentials(inputLogin, inputPassword)) {
    return NextResponse.json(
      { error: "Неверный логин или пароль" },
      { status: 401 }
    );
  }

  const token = createSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: "Сервис авторизации не настроен" },
      { status: 503 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    ...parserSessionCookieOptions,
    value: token,
    maxAge: PARSER_SESSION_MAX_AGE,
  });

  return response;
}
