"use client";

import { motion } from "framer-motion";
import { Clock, History } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { transitionReveal } from "@/lib/motion/presets";
import type { SearchHistoryItem } from "@/lib/parser/types";
import { cn } from "@/lib/utils/cn";

type ParserSearchHistoryProps = {
  items: SearchHistoryItem[];
  onSelect: (item: SearchHistoryItem) => void;
};

export function ParserSearchHistory({ items, onSelect }: ParserSearchHistoryProps) {
  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitionReveal}
    >
      <GlassCard className="p-5 sm:p-6" hover={false}>
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-studio-charcoal">
          <History className="h-4 w-4 text-studio-accent" />
          Недавние запросы
        </div>

        <ul className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...transitionReveal, delay: index * 0.04 }}
            >
              <button
                type="button"
                onClick={() => onSelect(item)}
                className={cn(
                  "group inline-flex flex-col items-start rounded-2xl border border-white/70 bg-white/55 px-4 py-3 text-left shadow-sm motion-btn",
                  "hover:border-studio-accent/25 hover:bg-white/80 hover:shadow-glass"
                )}
              >
                <span className="text-sm font-medium text-studio-charcoal">
                  {item.niche}
                  <span className="text-neutral-400"> · </span>
                  {item.city}
                </span>
                <span className="mt-1 inline-flex items-center gap-1 text-xs text-neutral-500">
                  <Clock className="h-3 w-3" />
                  {item.resultCount} результатов
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      </GlassCard>
    </motion.div>
  );
}
