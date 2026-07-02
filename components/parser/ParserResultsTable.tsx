"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Search, Star } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ParserEmptyState } from "@/components/parser/ParserEmptyState";
import { ParserErrorState } from "@/components/parser/ParserErrorState";
import { ParserResultsSkeleton } from "@/components/parser/ParserResultsSkeleton";
import { ParserTimeoutState } from "@/components/parser/ParserTimeoutState";
import { transitionReveal } from "@/lib/motion/presets";
import type { ParserCompany, ParserResultsViewState } from "@/lib/parser/types";
import { cn } from "@/lib/utils/cn";

type ParserResultsTableProps = {
  companies: ParserCompany[];
  viewState: ParserResultsViewState;
  errorMessage?: string | null;
  onRetry?: () => void;
  emptyDescription?: string;
};

export function ParserResultsTable({
  companies,
  viewState,
  errorMessage,
  onRetry,
  emptyDescription,
}: ParserResultsTableProps) {
  return (
    <AnimatePresence mode="wait">
      {viewState === "idle" && (
        <motion.div
          key="idle"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={transitionReveal}
        >
          <GlassCard className="p-10 text-center" hover={false}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl glass border-white/60 shadow-glass">
              <Search className="h-6 w-6 text-studio-accent" />
            </div>
            <p className="text-sm text-neutral-500">
              Укажите нишу и город, затем нажмите «Найти компании». Данные
              загружаются напрямую из Yandex Maps.
            </p>
          </GlassCard>
        </motion.div>
      )}

      {viewState === "loading" && (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transitionReveal}
        >
          <ParserResultsSkeleton />
        </motion.div>
      )}

      {viewState === "timeout" && (
        <motion.div
          key="timeout"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={transitionReveal}
        >
          <ParserTimeoutState
            message={
              errorMessage ??
              "Слишком долгий ответ от сервиса. Попробуйте позже."
            }
            onRetry={onRetry}
          />
        </motion.div>
      )}

      {viewState === "error" && (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={transitionReveal}
        >
          <ParserErrorState
            message={errorMessage ?? "Неизвестная ошибка"}
            onRetry={onRetry}
          />
        </motion.div>
      )}

      {viewState === "empty" && (
        <motion.div
          key="empty"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={transitionReveal}
        >
          <ParserEmptyState description={emptyDescription} />
        </motion.div>
      )}

      {viewState === "success" && (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={transitionReveal}
        >
          <ResultsTable companies={companies} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ResultsTable({ companies }: { companies: ParserCompany[] }) {
  return (
    <GlassCard className="overflow-hidden p-0" hover={false}>
      <div className="overflow-x-auto" data-lenis-prevent>
        <table className="w-full min-w-[880px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200/70 bg-white/40 text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-5 py-4 font-medium">Компания</th>
              <th className="px-5 py-4 font-medium">Телефон</th>
              <th className="px-5 py-4 font-medium">Рейтинг</th>
              <th className="px-5 py-4 font-medium">Отзывы</th>
              <th className="px-5 py-4 font-medium">Сайт</th>
              <th className="px-5 py-4 font-medium">Карты</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company, index) => (
              <motion.tr
                key={company.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...transitionReveal, delay: index * 0.03 }}
                className={cn(
                  "border-b border-neutral-100/80 last:border-0 hover:bg-white/50",
                  company.priority === "high" && "bg-studio-accent/[0.03]"
                )}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-studio-charcoal">
                      {company.name}
                    </span>
                    {company.priority === "high" && (
                      <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-600">
                        Hot
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-neutral-400">
                    {company.niche} · {company.city}
                  </div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-neutral-600">
                  <a
                    href={`tel:${company.phone.replace(/\D/g, "")}`}
                    className="hover:text-studio-accent"
                  >
                    {company.phone}
                  </a>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1 font-medium text-studio-charcoal">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {company.rating.toFixed(1)}
                  </span>
                </td>
                <td className="px-5 py-4 text-neutral-600">
                  {company.reviewsCount}
                </td>
                <td className="px-5 py-4">
                  <WebsiteBadge hasWebsite={company.hasWebsite} />
                </td>
                <td className="px-5 py-4">
                  <a
                    href={company.yandexUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-studio-accent hover:underline"
                  >
                    Открыть
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

function WebsiteBadge({ hasWebsite }: { hasWebsite: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        hasWebsite
          ? "bg-neutral-100 text-neutral-600"
          : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60"
      )}
    >
      {hasWebsite ? "Есть сайт" : "Без сайта"}
    </span>
  );
}
