import { DEFAULT_PARSER_FILTERS } from "@/lib/parser/filters";
import type { ParserFilters, ParserSearchRequest } from "@/lib/parser/types";

function normalizeFilters(raw: unknown): ParserFilters {
  if (!raw || typeof raw !== "object") return DEFAULT_PARSER_FILTERS;

  const f = raw as Record<string, unknown>;

  return {
    onlyWithoutWebsite:
      typeof f.onlyWithoutWebsite === "boolean"
        ? f.onlyWithoutWebsite
        : DEFAULT_PARSER_FILTERS.onlyWithoutWebsite,
    minReviews:
      typeof f.minReviews === "number" && f.minReviews >= 0
        ? f.minReviews
        : Number(f.minReviews) >= 0
          ? Number(f.minReviews)
          : DEFAULT_PARSER_FILTERS.minReviews,
    minRating:
      typeof f.minRating === "number"
        ? Math.min(5, Math.max(0, f.minRating))
        : DEFAULT_PARSER_FILTERS.minRating,
  };
}

export function parseSearchRequest(body: unknown): ParserSearchRequest | null {
  if (!body || typeof body !== "object") return null;

  const data = body as Record<string, unknown>;
  const niche = typeof data.niche === "string" ? data.niche.trim() : "";
  const city = typeof data.city === "string" ? data.city.trim() : "";

  if (!niche || !city) return null;

  return {
    niche,
    city,
    filters: normalizeFilters(data.filters),
  };
}
