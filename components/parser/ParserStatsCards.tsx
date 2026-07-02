"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { transitionReveal } from "@/lib/motion/presets";
import type { ParserDashboardStats } from "@/lib/parser/types";
import { cn } from "@/lib/utils/cn";

type ParserStatsCardsProps = {
  stats: ParserDashboardStats;
  visible: boolean;
};

const cards = [
  {
    key: "totalFound",
    label: "Найдено",
    icon: Building2,
    accent: "text-studio-accent",
    bg: "bg-studio-accent/10",
  },
  {
    key: "withoutWebsite",
    label: "Без сайта",
    icon: TrendingUp,
    accent: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  {
    key: "averageRating",
    label: "Средний рейтинг",
    icon: Star,
    accent: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  {
    key: "highPriorityLeads",
    label: "Приоритетные лиды",
    icon: Sparkles,
    accent: "text-violet-600",
    bg: "bg-violet-500/10",
  },
] as const;

export function ParserStatsCards({ stats, visible }: ParserStatsCardsProps) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitionReveal}
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        const value = formatStatValue(card.key, stats);

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitionReveal, delay: index * 0.05 }}
          >
            <GlassCard className="p-5" hover={false}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    {card.label}
                  </p>
                  <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-studio-charcoal">
                    {value}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-2xl",
                    card.bg
                  )}
                >
                  <Icon className={cn("h-5 w-5", card.accent)} />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function formatStatValue(
  key: (typeof cards)[number]["key"],
  stats: ParserDashboardStats
): string {
  switch (key) {
    case "averageRating":
      return stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—";
    default:
      return String(stats[key]);
  }
}
