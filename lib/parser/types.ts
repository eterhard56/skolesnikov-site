export type ParserCompany = {
  id: string;
  name: string;
  phone: string;
  website: string;
  rating: number;
  reviewsCount: number;
  hasWebsite: boolean;
  address: string;
  yandexUrl: string;
  niche: string;
  city: string;
  priority?: "high" | "medium" | "low";
};

export type ParserFilters = {
  onlyWithoutWebsite: boolean;
  minReviews: number;
  minRating: number;
};

export type ParserSearchParams = {
  niche: string;
  city: string;
};

export type ParserSearchRequest = ParserSearchParams & {
  filters: ParserFilters;
};

export type ParserDashboardStats = {
  totalFound: number;
  withoutWebsite: number;
  averageRating: number;
  highPriorityLeads: number;
};

export type ParserSearchMeta = {
  totalMatched: number;
  totalFiltered: number;
  tookMs: number;
  provider: string;
  query: string;
  cached?: boolean;
};

export type ParserSearchResponse = {
  companies: ParserCompany[];
  allCompanies: ParserCompany[];
  stats: ParserDashboardStats;
  meta: ParserSearchMeta;
};

export type ParserSearchErrorResponse = {
  error: string;
  code?: string;
};

export type ParserSearchFailureResponse = {
  success: false;
  error: string;
};

export type SearchHistoryItem = {
  id: string;
  niche: string;
  city: string;
  resultCount: number;
  searchedAt: string;
};

export type ParserResultsViewState =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error"
  | "timeout";
