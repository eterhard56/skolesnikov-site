"use client";

import { Search } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils/cn";

type ParserSearchFormProps = {
  niche: string;
  city: string;
  isSearching: boolean;
  onNicheChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onSearch: () => void;
};

export function ParserSearchForm({
  niche,
  city,
  isSearching,
  onNicheChange,
  onCityChange,
  onSearch,
}: ParserSearchFormProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch();
  }

  return (
    <GlassCard className="p-5 sm:p-6 md:p-7" hover={false}>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <div>
          <label
            htmlFor="parser-niche"
            className="mb-2 block text-sm font-medium text-studio-charcoal"
          >
            Ниша / тип бизнеса
          </label>
          <input
            id="parser-niche"
            type="text"
            value={niche}
            onChange={(e) => onNicheChange(e.target.value)}
            placeholder="кондитерская, стоматология, автосервис…"
            className={fieldClass}
          />
        </div>

        <div>
          <label
            htmlFor="parser-city"
            className="mb-2 block text-sm font-medium text-studio-charcoal"
          >
            Город
          </label>
          <input
            id="parser-city"
            type="text"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            placeholder="Оренбург"
            className={fieldClass}
          />
        </div>

        <button
          type="submit"
          disabled={isSearching}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-2xl bg-studio-charcoal px-6 py-3 text-sm font-medium text-white shadow-premium motion-btn md:min-w-[200px]",
            "hover:bg-studio-slate disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          <Search className="h-4 w-4" />
          {isSearching ? "Поиск…" : "Найти компании"}
        </button>
      </form>
    </GlassCard>
  );
}

const fieldClass = cn(
  "w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm text-studio-charcoal shadow-sm",
  "placeholder:text-neutral-400 outline-none transition-colors",
  "focus:border-studio-accent/40 focus:ring-2 focus:ring-studio-accent/15"
);
