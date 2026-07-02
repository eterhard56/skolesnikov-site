import { YANDEX_MAX_RESULTS } from "@/lib/parser/config";
import {
  PARSER_ERROR_CODES,
  ParserError,
} from "@/lib/parser/errors";
import { normalizeYandexResults } from "@/lib/parser/normalize";
import { parserLog } from "@/lib/parser/logger";
import { buildCombinedSearchQuery } from "@/lib/parser/query";
import { fetchYandexMapsHtml } from "@/lib/parser/scraping/fetch-yandex-maps";
import { parseYandexMapsHtml } from "@/lib/parser/scraping/parse-yandex-html";
import type { ParserCompany } from "@/lib/parser/types";
import type {
  ParserDataProvider,
  ProviderSearchParams,
} from "@/lib/parser/providers/types";

export class YandexDirectProvider implements ParserDataProvider {
  readonly id = "yandex-direct";
  readonly label = "Yandex Maps · Direct";

  async search(params: ProviderSearchParams): Promise<ParserCompany[]> {
    const niche = params.niche.trim();
    const city = params.city.trim();

    if (!niche || !city) {
      return [];
    }

    const query = buildCombinedSearchQuery(niche, city);

    parserLog("provider search start", {
      provider: this.id,
      niche,
      city,
      query,
    });

    const html = await fetchYandexMapsHtml(query);
    const rawCards = parseYandexMapsHtml(html, YANDEX_MAX_RESULTS);
    const companies = normalizeYandexResults(rawCards, niche, city);

    if (companies.length === 0) {
      throw new ParserError(
        "Компании не найдены",
        404,
        PARSER_ERROR_CODES.EMPTY_RESULTS
      );
    }

    parserLog("provider search complete", {
      provider: this.id,
      count: companies.length,
    });

    return companies;
  }
}
