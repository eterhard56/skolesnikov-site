"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { transitionReveal } from "@/lib/motion/presets";

const ROWS = 6;

export function ParserResultsSkeleton() {
  return (
    <GlassCard className="overflow-hidden p-0" hover={false}>
      <div className="border-b border-neutral-200/70 bg-white/40 px-5 py-4">
        <div className="flex gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-3 w-16 animate-pulse rounded-full bg-neutral-200/80"
            />
          ))}
        </div>
      </div>

      <div className="divide-y divide-neutral-100/80">
        {Array.from({ length: ROWS }).map((_, row) => (
          <motion.div
            key={row}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...transitionReveal, delay: row * 0.06 }}
            className="flex flex-wrap items-center gap-4 px-5 py-5"
          >
            <div className="min-w-[200px] flex-1 space-y-2">
              <div className="h-4 w-48 animate-pulse rounded-lg bg-neutral-200/80" />
              <div className="h-3 w-32 animate-pulse rounded-lg bg-neutral-100" />
            </div>
            <div className="h-4 w-28 animate-pulse rounded-lg bg-neutral-200/70" />
            <div className="h-4 w-12 animate-pulse rounded-lg bg-neutral-200/70" />
            <div className="h-4 w-10 animate-pulse rounded-lg bg-neutral-200/70" />
            <div className="h-7 w-20 animate-pulse rounded-full bg-emerald-100/80" />
            <div className="h-4 w-16 animate-pulse rounded-lg bg-studio-accent/20" />
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
