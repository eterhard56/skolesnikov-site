import { NextResponse } from "next/server";
import { isUchetAuthConfigured } from "@/lib/uchet/auth-config";
import {
  readCloudState,
  writeCloudState,
} from "@/lib/uchet/cloud-store";
import { importStateJson } from "@/lib/uchet/storage";
import type { UchetState } from "@/lib/uchet/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isUchetAuthConfigured()) {
    return NextResponse.json(
      { error: "Сервис авторизации не настроен" },
      { status: 503 }
    );
  }

  try {
    const payload = await readCloudState();
    if (!payload) {
      return NextResponse.json({ state: null, updatedAt: null });
    }
    return NextResponse.json(payload);
  } catch (error) {
    console.error("[uchet/data GET]", error);
    return NextResponse.json(
      { error: "Не удалось загрузить данные" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  if (!isUchetAuthConfigured()) {
    return NextResponse.json(
      { error: "Сервис авторизации не настроен" },
      { status: 503 }
    );
  }

  let body: { state?: UchetState };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  if (!body.state || typeof body.state !== "object") {
    return NextResponse.json({ error: "Нет данных state" }, { status: 400 });
  }

  try {
    const state = importStateJson(JSON.stringify(body.state));
    const payload = await writeCloudState(state);
    return NextResponse.json(payload);
  } catch (error) {
    console.error("[uchet/data PUT]", error);
    return NextResponse.json(
      { error: "Не удалось сохранить данные" },
      { status: 500 }
    );
  }
}
