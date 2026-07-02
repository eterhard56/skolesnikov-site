"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { ParserFiltersPanel } from "@/components/parser/ParserFilters";
import { ParserHeader } from "@/components/parser/ParserHeader";
import { ParserResultsTable } from "@/components/parser/ParserResultsTable";
import { ParserSearchForm } from "@/components/parser/ParserSearchForm";
import { ParserSearchHistory } from "@/components/parser/ParserSearchHistory";
import { ParserStatsCards } from "@/components/parser/ParserStatsCards";
import { ParserToolbar } from "@/components/parser/ParserToolbar";
import { transitionReveal } from "@/lib/motion/presets";
import { downloadCsv } from "@/lib/parser/export-csv";
import { useParserSearch } from "@/lib/parser/hooks/useParserSearch";
import type { SearchHistoryItem } from "@/lib/parser/types";

export function ParserDashboard() {
  const {
    niche,
    city,
    filters,
    filteredCompanies,
    stats,
    meta,
    history,
    viewState,
    errorMessage,
    isSearching,
    hasSearched,
    allCompanies,
    setNiche,
    setCity,
    setFilters,
    runSearch,
  } = useParserSearch();

  const handleSearch = useCallback(() => {
    void runSearch();
  }, [runSearch]);

  const handleHistorySelect = useCallback(
    (item: SearchHistoryItem) => {
      void runSearch({ niche: item.niche, city: item.city });
    },
    [runSearch]
  );

  const handleExport = useCallback(() => {
    if (filteredCompanies.length === 0) return;
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(filteredCompanies, `parser-leads-${stamp}.csv`);
  }, [filteredCompanies]);

  const showStats =
    hasSearched &&
    viewState !== "loading" &&
    viewState !== "error" &&
    viewState !== "timeout";

  return (
    <div className="pb-16">
      <ParserHeader />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transitionReveal}
        className="space-y-5"
      >
        <ParserSearchForm
          niche={niche}
          city={city}
          isSearching={isSearching}
          onNicheChange={setNiche}
          onCityChange={setCity}
          onSearch={handleSearch}
        />

        <ParserSearchHistory items={history} onSelect={handleHistorySelect} />

        <ParserStatsCards stats={stats} visible={showStats} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <ParserToolbar
            onExport={handleExport}
            exportDisabled={filteredCompanies.length === 0}
            isBusy={isSearching}
          />
          {meta && showStats && (
            <p className="text-xs text-neutral-400 sm:text-right">
              {meta.provider}
              {meta.cached ? " · cache" : ""} · {meta.query} · {meta.tookMs} мс ·{" "}
              {meta.totalFiltered} из {meta.totalMatched}
            </p>
          )}
        </div>

        <ParserFiltersPanel
          filters={filters}
          onChange={setFilters}
          resultCount={filteredCompanies.length}
          disabled={isSearching}
        />

        <ParserResultsTable
          companies={filteredCompanies}
          viewState={viewState}
          errorMessage={errorMessage}
          onRetry={handleSearch}
          emptyDescription={
            allCompanies.length > 0
              ? "По заданным фильтрам ничего не подошло. Ослабьте фильтры или измените запрос."
              : undefined
          }
        />
      </motion.div>
    </div>
  );
}
