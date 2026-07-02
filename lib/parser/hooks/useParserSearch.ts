"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchParserSearch, ParserSearchApiError } from "@/lib/parser/client/search-api";
import {
  addSearchHistoryEntry,
  loadSearchHistory,
} from "@/lib/parser/client/search-history";
import { applyParserFilters, DEFAULT_PARSER_FILTERS } from "@/lib/parser/filters";
import { computeParserStats } from "@/lib/parser/services/stats";
import type {
  ParserCompany,
  ParserDashboardStats,
  ParserFilters,
  ParserResultsViewState,
  ParserSearchMeta,
  SearchHistoryItem,
} from "@/lib/parser/types";

const EMPTY_STATS: ParserDashboardStats = {
  totalFound: 0,
  withoutWebsite: 0,
  averageRating: 0,
  highPriorityLeads: 0,
};

function resolveViewState(
  code: string | undefined,
  message: string
): { state: ParserResultsViewState; message: string } {
  if (code === "TIMEOUT") {
    return {
      state: "timeout",
      message: "Слишком долгий ответ от сервиса. Попробуйте позже.",
    };
  }
  if (code === "EMPTY_RESULTS") {
    return { state: "empty", message };
  }
  return { state: "error", message };
}

export function useParserSearch() {
  const [niche, setNiche] = useState("");
  const [city, setCity] = useState("Оренбург");
  const [filters, setFilters] = useState<ParserFilters>(DEFAULT_PARSER_FILTERS);
  const [allCompanies, setAllCompanies] = useState<ParserCompany[]>([]);
  const [meta, setMeta] = useState<ParserSearchMeta | null>(null);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [viewState, setViewState] = useState<ParserResultsViewState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadSearchHistory());
  }, []);

  const filteredCompanies = useMemo(
    () => applyParserFilters(allCompanies, filters),
    [allCompanies, filters]
  );

  const stats = useMemo(
    () =>
      allCompanies.length > 0
        ? computeParserStats(filteredCompanies, allCompanies)
        : EMPTY_STATS,
    [filteredCompanies, allCompanies]
  );

  const runSearch = useCallback(
    async (overrides?: { niche?: string; city?: string }) => {
      const searchNiche = (overrides?.niche ?? niche).trim();
      const searchCity = (overrides?.city ?? city).trim();

      if (!searchNiche || !searchCity) {
        setErrorMessage("Укажите нишу и город");
        setViewState("error");
        return;
      }

      if (overrides?.niche !== undefined) setNiche(overrides.niche);
      if (overrides?.city !== undefined) setCity(overrides.city);

      setViewState("loading");
      setErrorMessage(null);

      try {
        const response = await fetchParserSearch({
          niche: searchNiche,
          city: searchCity,
          filters,
        });

        setAllCompanies(response.allCompanies);
        setMeta(response.meta);
        setViewState(
          response.allCompanies.length === 0 ? "empty" : "success"
        );

        const nextHistory = addSearchHistoryEntry({
          niche: searchNiche,
          city: searchCity,
          resultCount: response.meta.totalFiltered,
        });
        setHistory(nextHistory);
      } catch (err) {
        const apiErr = err instanceof ParserSearchApiError ? err : null;
        const message =
          apiErr?.message ?? "Ошибка сети. Проверьте подключение.";
        const resolved = resolveViewState(apiErr?.code, message);
        setErrorMessage(resolved.message);
        setViewState(resolved.state);
      }
    },
    [niche, city, filters]
  );

  useEffect(() => {
    if (allCompanies.length === 0) return;
    if (
      viewState === "loading" ||
      viewState === "error" ||
      viewState === "timeout" ||
      viewState === "idle"
    ) {
      return;
    }
    setViewState(filteredCompanies.length === 0 ? "empty" : "success");
  }, [filteredCompanies, allCompanies.length, viewState]);

  return {
    niche,
    city,
    filters,
    filteredCompanies,
    stats,
    meta,
    history,
    viewState,
    errorMessage,
    isSearching: viewState === "loading",
    hasSearched: viewState !== "idle",
    allCompanies,
    setNiche,
    setCity,
    setFilters,
    runSearch,
  };
}
