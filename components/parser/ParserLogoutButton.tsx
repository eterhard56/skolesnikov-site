"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, LogOut } from "lucide-react";
import { transitionFast } from "@/lib/motion/presets";
import { PARSER_LOGIN_PATH } from "@/lib/parser/routes";
import { cn } from "@/lib/utils/cn";

export function ParserLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      await fetch("/api/parser/logout", { method: "POST" });
      router.push(PARSER_LOGIN_PATH);
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      aria-busy={loading}
      className={cn(
        "relative inline-flex min-w-[120px] items-center justify-center gap-2 self-start rounded-2xl glass border-white/60 px-4 py-2.5 text-sm font-medium text-studio-charcoal shadow-glass motion-btn sm:self-auto",
        "hover:shadow-glass-lg disabled:cursor-not-allowed disabled:opacity-70"
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={transitionFast}
            className="inline-flex items-center gap-2"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Выход…
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={transitionFast}
            className="inline-flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
