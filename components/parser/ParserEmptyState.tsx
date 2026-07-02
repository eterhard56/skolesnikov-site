"use client";

import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { transitionReveal } from "@/lib/motion/presets";

type ParserEmptyStateProps = {
  title?: string;
  description?: string;
};

export function ParserEmptyState({
  title = "Компании не найдены",
  description = "Яндекс Карты не вернули организации по этому запросу. Попробуйте другую формулировку ниши или город.",
}: ParserEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitionReveal}
    >
      <GlassCard className="p-10 sm:p-12 text-center" hover={false}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100/80">
          <SearchX className="h-7 w-7 text-neutral-400" />
        </div>
        <h3 className="font-display text-lg font-semibold text-studio-charcoal">
          {title}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
          {description}
        </p>
      </GlassCard>
    </motion.div>
  );
}
