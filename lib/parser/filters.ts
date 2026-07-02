import type { ParserCompany, ParserFilters } from "@/lib/parser/types";

export const DEFAULT_PARSER_FILTERS: ParserFilters = {
  onlyWithoutWebsite: true,
  minReviews: 0,
  minRating: 0,
};

export function applyParserFilters(
  companies: ParserCompany[],
  filters: ParserFilters
): ParserCompany[] {
  return companies.filter((company) => {
    if (filters.onlyWithoutWebsite && company.hasWebsite) return false;
    if (company.reviewsCount < filters.minReviews) return false;
    if (company.rating < filters.minRating) return false;
    return true;
  });
}
