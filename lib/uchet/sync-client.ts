"use client";

import type { UchetState } from "@/lib/uchet/types";

export type SyncStatus = "idle" | "loading" | "saving" | "saved" | "error" | "offline";

export async function fetchCloudState(): Promise<{
  state: UchetState | null;
  updatedAt: string | null;
}> {
  const res = await fetch("/api/uchet/data", {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });

  if (res.status === 401) {
    throw new Error("unauthorized");
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "load_failed");
  }

  const data = (await res.json()) as {
    state: UchetState | null;
    updatedAt: string | null;
  };
  return data;
}

export async function pushCloudState(state: UchetState): Promise<{
  state: UchetState;
  updatedAt: string;
}> {
  const res = await fetch("/api/uchet/data", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ state }),
  });

  if (res.status === 401) {
    throw new Error("unauthorized");
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "save_failed");
  }

  return (await res.json()) as { state: UchetState; updatedAt: string };
}
