"use client";

import { Filter } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { ParserFilters } from "@/lib/parser/types";
import { cn } from "@/lib/utils/cn";

type ParserFiltersProps = {
  filters: ParserFilters;
  onChange: (filters: ParserFilters) => void;
  resultCount: number;
  disabled?: boolean;
};

export function ParserFiltersPanel({
  filters,
  onChange,
  resultCount,
  disabled = false,
}: ParserFiltersProps) {
  return (
    <GlassCard className="p-5 sm:p-6" hover={false}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-studio-charcoal">
          <Filter className="h-4 w-4 text-studio-accent" />
          Фильтры
        </div>
        <span className="rounded-full bg-studio-accent/10 px-3 py-1 text-xs font-medium text-studio-accent">
          {resultCount} в выдаче
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/70 bg-white/50 px-4 py-3 sm:col-span-2 lg:col-span-1">
          <input
            type="checkbox"
            checked={filters.onlyWithoutWebsite}
            disabled={disabled}
            onChange={(e) =>
              onChange({ ...filters, onlyWithoutWebsite: e.target.checked })
            }
            className="h-4 w-4 rounded border-neutral-300 text-studio-accent focus:ring-studio-accent/30 disabled:opacity-50"
          />
          <span className="text-sm text-studio-charcoal">Только без сайта</span>
        </label>

        <div>
          <label
            htmlFor="min-reviews"
            className="mb-2 block text-xs font-medium text-neutral-500"
          >
            Мин. отзывов
          </label>
          <input
            id="min-reviews"
            type="number"
            min={0}
            step={1}
            disabled={disabled}
            value={filters.minReviews}
            onChange={(e) =>
              onChange({
                ...filters,
                minReviews: Math.max(0, Number(e.target.value) || 0),
              })
            }
            className={filterInputClass}
          />
        </div>

        <div>
          <label
            htmlFor="min-rating"
            className="mb-2 block text-xs font-medium text-neutral-500"
          >
            Мин. рейтинг
          </label>
          <input
            id="min-rating"
            type="number"
            min={0}
            max={5}
            step={0.1}
            disabled={disabled}
            value={filters.minRating}
            onChange={(e) =>
              onChange({
                ...filters,
                minRating: Math.min(
                  5,
                  Math.max(0, Number(e.target.value) || 0)
                ),
              })
            }
            className={filterInputClass}
          />
        </div>
      </div>
    </GlassCard>
  );
}

const filterInputClass = cn(
  "w-full rounded-xl border border-white/70 bg-white/80 px-3 py-2.5 text-sm text-studio-charcoal shadow-sm outline-none",
  "focus:border-studio-accent/40 focus:ring-2 focus:ring-studio-accent/15"
);
