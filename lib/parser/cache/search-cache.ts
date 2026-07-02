import { PARSER_SEARCH_CACHE_TTL_MS } from "@/lib/parser/config";
import { parserLog } from "@/lib/parser/logger";
import type { ParserCompany } from "@/lib/parser/types";

type CacheEntry = {
  companies: ParserCompany[];
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();

function buildCacheKey(niche: string, city: string): string {
  return `${niche.trim().toLowerCase()}:${city.trim().toLowerCase()}`;
}

function purgeExpired(): void {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt <= now) cache.delete(key);
  }
}

export function getCachedSearch(
  niche: string,
  city: string
): ParserCompany[] | null {
  purgeExpired();
  const key = buildCacheKey(niche, city);
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.companies;
}

export function setCachedSearch(
  niche: string,
  city: string,
  companies: ParserCompany[]
): void {
  purgeExpired();
  const key = buildCacheKey(niche, city);
  cache.set(key, {
    companies,
    expiresAt: Date.now() + PARSER_SEARCH_CACHE_TTL_MS,
  });
  parserLog("search cache stored", {
    key,
    count: companies.length,
    ttlMinutes: PARSER_SEARCH_CACHE_TTL_MS / 60_000,
  });
}

export function clearSearchCache(): void {
  cache.clear();
}
