import type { ParserCompany } from "@/lib/parser/types";

export type ProviderSearchParams = {
  niche: string;
  city: string;
};

/**
 * Pluggable data source for parser searches.
 * Future: YandexMapsParserProvider, OpenAIEnrichmentProvider, etc.
 */
export interface ParserDataProvider {
  readonly id: string;
  readonly label: string;
  search(params: ProviderSearchParams): Promise<ParserCompany[]>;
}
