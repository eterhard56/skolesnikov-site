import { applyParserFilters } from "@/lib/parser/filters";
import { YandexDirectProvider } from "@/lib/parser/providers/yandex-direct";
import type { ParserDataProvider } from "@/lib/parser/providers/types";
import { buildCombinedSearchQuery } from "@/lib/parser/query";
import {
  getCachedSearch,
  setCachedSearch,
} from "@/lib/parser/cache/search-cache";
import { parserLog } from "@/lib/parser/logger";
import {
  computeParserStats,
  enrichCompanyPriority,
} from "@/lib/parser/services/stats";
import type { ParserSearchRequest, ParserSearchResponse } from "@/lib/parser/types";

export class ParserService {
  constructor(private readonly provider: ParserDataProvider) {}

  async search(request: ParserSearchRequest): Promise<ParserSearchResponse> {
    const started = Date.now();
    const query = buildCombinedSearchQuery(request.niche, request.city);

    parserLog("search request received", {
      niche: request.niche,
      city: request.city,
      filters: request.filters,
      query,
    });

    const cached = getCachedSearch(request.niche, request.city);
    let enriched;

    if (cached) {
      parserLog("cache hit — skipping Yandex fetch", {
        query,
        count: cached.length,
      });
      enriched = cached.map(enrichCompanyPriority);
    } else {
      const raw = await this.provider.search({
        niche: request.niche,
        city: request.city,
      });
      enriched = raw.map(enrichCompanyPriority);
      setCachedSearch(request.niche, request.city, enriched);
    }

    const filtered = applyParserFilters(enriched, request.filters).map(
      enrichCompanyPriority
    );

    const response: ParserSearchResponse = {
      companies: filtered,
      allCompanies: enriched,
      stats: computeParserStats(filtered, enriched),
      meta: {
        totalMatched: enriched.length,
        totalFiltered: filtered.length,
        tookMs: Date.now() - started,
        provider: this.provider.id,
        query,
        cached: Boolean(cached),
      },
    };

    parserLog("search response ready", {
      totalMatched: response.meta.totalMatched,
      totalFiltered: response.meta.totalFiltered,
      tookMs: response.meta.tookMs,
      cached: response.meta.cached,
    });

    return response;
  }
}

const defaultProvider = new YandexDirectProvider();

export const parserService = new ParserService(defaultProvider);
