"use client";

import { motion } from "framer-motion";
import { Clock, RefreshCw } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { transitionReveal } from "@/lib/motion/presets";
import { cn } from "@/lib/utils/cn";

type ParserTimeoutStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ParserTimeoutState({ message, onRetry }: ParserTimeoutStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitionReveal}
    >
      <GlassCard className="p-10 sm:p-12 text-center" hover={false}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
          <Clock className="h-7 w-7 text-amber-600" />
        </div>
        <h3 className="font-display text-lg font-semibold text-studio-charcoal">
          Превышено время ожидания
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-amber-700/90">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={cn(
              "mt-6 inline-flex items-center gap-2 rounded-2xl bg-studio-charcoal px-5 py-2.5 text-sm font-medium text-white shadow-premium motion-btn",
              "hover:bg-studio-slate"
            )}
          >
            <RefreshCw className="h-4 w-4" />
            Повторить
          </button>
        )}
      </GlassCard>
    </motion.div>
  );
}
