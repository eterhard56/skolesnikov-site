import * as cheerio from "cheerio";
import { parserLog } from "@/lib/parser/logger";

export type YandexStateBusinessItem = {
  type?: string;
  id?: string | number;
  title?: string;
  name?: string;
  address?: string;
  phones?: Array<{ number?: string; value?: string }>;
  urls?: string[];
  ratingData?: {
    ratingValue?: number;
    ratingCount?: number;
    reviewCount?: number;
  };
  categories?: Array<{ name?: string }>;
  uri?: string;
};

const WINDOW_STATE_PATTERNS = [
  /window\.__INITIAL_STATE__\s*=\s*/i,
  /window\.__DATA__\s*=\s*/i,
  /window\.__PRELOADED_STATE__\s*=\s*/i,
  /window\.__SSR_DATA__\s*=\s*/i,
];

function extractBalancedJson(source: string, openBraceIndex: number): string | null {
  if (openBraceIndex < 0 || source[openBraceIndex] !== "{") return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = openBraceIndex; i < source.length; i++) {
    const ch = source[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (ch === "\\" && inString) {
      escaped = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return source.slice(openBraceIndex, i + 1);
    }
  }

  return null;
}

function tryParseJson(raw: string): unknown | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return null;
  }
}

function extractFromScriptContent(content: string): unknown[] {
  const parsed: unknown[] = [];

  const direct = tryParseJson(content);
  if (direct !== null) {
    parsed.push(direct);
    return parsed;
  }

  for (const pattern of WINDOW_STATE_PATTERNS) {
    const match = pattern.exec(content);
    if (!match) continue;

    const braceIndex = content.indexOf("{", match.index + match[0].length);
    const jsonText = extractBalancedJson(content, braceIndex);
    if (!jsonText) continue;

    const value = tryParseJson(jsonText);
    if (value !== null) parsed.push(value);
  }

  return parsed;
}

function extractStateViewFromHtml(html: string): unknown[] {
  const parsed: unknown[] = [];
  const regex =
    /<script[^>]*class=["'][^"']*state-view[^"']*["'][^>]*>([\s\S]*?)<\/script>/gi;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const value = tryParseJson(match[1] ?? "");
    if (value !== null) parsed.push(value);
  }

  return parsed;
}

export function extractJsonBlobsFromHtml(html: string): unknown[] {
  const blobs: unknown[] = [];
  const seen = new Set<string>();

  const addBlob = (value: unknown) => {
    if (value === null || value === undefined) return;
    const key = JSON.stringify(value).slice(0, 200);
    if (seen.has(key)) return;
    seen.add(key);
    blobs.push(value);
  };

  for (const value of extractStateViewFromHtml(html)) {
    addBlob(value);
  }

  const $ = cheerio.load(html);

  $("script").each((_, el) => {
    const content = $(el).html()?.trim();
    if (!content || content.length < 100) return;

    for (const value of extractFromScriptContent(content)) {
      addBlob(value);
    }
  });

  parserLog("JSON blobs found", { count: blobs.length });

  return blobs;
}

function isBusinessCandidate(
  value: unknown
): value is YandexStateBusinessItem {
  if (!value || typeof value !== "object") return false;
  const obj = value as YandexStateBusinessItem;
  const name = obj.title ?? obj.name;
  return obj.type === "business" && Boolean(name) && Boolean(obj.id);
}

export function findBusinessItemsInJson(
  data: unknown,
  maxDepth = 14
): YandexStateBusinessItem[] {
  const found: YandexStateBusinessItem[] = [];
  const seenIds = new Set<string>();

  const visit = (node: unknown, depth: number) => {
    if (node === null || node === undefined || depth > maxDepth) return;

    if (Array.isArray(node)) {
      for (const item of node) visit(item, depth + 1);
      return;
    }

    if (typeof node !== "object") return;

    if (isBusinessCandidate(node)) {
      const id = String(node.id);
      if (!seenIds.has(id)) {
        seenIds.add(id);
        found.push(node);
      }
    }

    for (const value of Object.values(node as Record<string, unknown>)) {
      visit(value, depth + 1);
    }
  };

  visit(data, 0);
  return found;
}

export function extractBusinessesFromHtml(
  html: string,
  maxItems: number
): YandexStateBusinessItem[] {
  const blobs = extractJsonBlobsFromHtml(html);
  const allItems: YandexStateBusinessItem[] = [];
  const seenIds = new Set<string>();

  for (let blobIndex = 0; blobIndex < blobs.length; blobIndex++) {
    const items = findBusinessItemsInJson(blobs[blobIndex]);
    parserLog("parsed entities count", {
      blobIndex,
      entities: items.length,
    });

    for (const item of items) {
      const id = String(item.id);
      if (seenIds.has(id)) continue;
      seenIds.add(id);
      allItems.push(item);
    }
  }

  parserLog("extracted businesses count", {
    total: allItems.length,
    capped: Math.min(allItems.length, maxItems),
  });

  return allItems.slice(0, maxItems);
}
