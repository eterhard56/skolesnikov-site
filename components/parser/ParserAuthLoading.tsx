"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { transitionReveal } from "@/lib/motion/presets";

type ParserAuthLoadingProps = {
  label?: string;
};

export function ParserAuthLoading({
  label = "Загрузка…",
}: ParserAuthLoadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={transitionReveal}
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl glass border-white/60 shadow-glass">
        <Loader2 className="h-6 w-6 animate-spin text-studio-accent" />
      </div>
      <p className="text-sm font-medium text-neutral-500">{label}</p>
    </motion.div>
  );
}
