import { get, put } from "@vercel/blob";
import {
  createInitialState,
  importStateJson,
} from "@/lib/uchet/storage";
import { mergeUchetStates } from "@/lib/uchet/merge";
import type { UchetState } from "@/lib/uchet/types";

export const UCHET_BLOB_PATH = "uchet/state.json";

export type CloudPayload = {
  state: UchetState;
  updatedAt: string;
};

function withUpdatedAt(state: UchetState, updatedAt?: string): CloudPayload {
  return {
    state,
    updatedAt: updatedAt ?? new Date().toISOString(),
  };
}

async function streamToText(stream: ReadableStream<Uint8Array>): Promise<string> {
  return new Response(stream).text();
}

export async function readCloudState(): Promise<CloudPayload | null> {
  try {
    const result = await get(UCHET_BLOB_PATH, {
      access: "private",
      useCache: false,
    });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return null;
    }

    const raw = await streamToText(result.stream);
    if (!raw.trim()) return null;

    const parsed = JSON.parse(raw) as
      | CloudPayload
      | UchetState
      | { state?: UchetState; updatedAt?: string };

    if (
      parsed &&
      typeof parsed === "object" &&
      "state" in parsed &&
      parsed.state &&
      typeof parsed.state === "object"
    ) {
      const state = importStateJson(JSON.stringify(parsed.state));
      const updatedAt =
        typeof (parsed as CloudPayload).updatedAt === "string"
          ? (parsed as CloudPayload).updatedAt
          : new Date(0).toISOString();
      return withUpdatedAt(state, updatedAt);
    }

    const state = importStateJson(raw);
    return withUpdatedAt(state, new Date(0).toISOString());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/not found|404|BlobNotFound/i.test(message)) {
      return null;
    }
    throw error;
  }
}

export async function writeCloudState(state: UchetState): Promise<CloudPayload> {
  const existing = await readCloudState();
  const merged = mergeUchetStates(existing?.state ?? null, state);
  const payload = withUpdatedAt(merged);
  await put(UCHET_BLOB_PATH, JSON.stringify(payload), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
  return payload;
}

export async function ensureCloudState(): Promise<CloudPayload> {
  const existing = await readCloudState();
  if (existing) return existing;
  return writeCloudState(createInitialState());
}
