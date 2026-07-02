"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Lock, Sparkles, User } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { transitionFast, transitionReveal } from "@/lib/motion/presets";
import { PARSER_DASHBOARD_PATH } from "@/lib/parser/routes";
import { cn } from "@/lib/utils/cn";

export function ParserLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/parser/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "Не удалось войти");
        return;
      }

      setSuccess(true);
      const from = searchParams.get("from") || PARSER_DASHBOARD_PATH;

      await new Promise((resolve) => setTimeout(resolve, 280));
      router.push(from);
      router.refresh();
    } catch {
      setError("Ошибка сети. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitionReveal}
      className="w-full max-w-md"
    >
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full glass border-white/60 px-4 py-2 text-xs font-medium text-studio-charcoal/80 shadow-glass">
          <Sparkles className="h-3.5 w-3.5 text-studio-accent" />
          AI Lead Parser
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-studio-charcoal sm:text-4xl">
          Вход в парсер
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Защищённый доступ к дашборду лидогенерации
        </p>
      </div>

      <GlassCard className="p-6 sm:p-8" hover={false}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="parser-login"
              className="mb-2 block text-sm font-medium text-studio-charcoal"
            >
              Логин
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                id="parser-login"
                type="text"
                autoComplete="username"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className={inputClass}
                placeholder="Введите логин"
                disabled={loading || success}
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="parser-password"
              className="mb-2 block text-sm font-medium text-studio-charcoal"
            >
              Пароль
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                id="parser-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="Введите пароль"
                disabled={loading || success}
                required
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                transition={transitionFast}
                className="overflow-hidden rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading || success}
            className={cn(
              "relative w-full overflow-hidden rounded-2xl bg-studio-charcoal px-5 py-3.5 text-sm font-medium text-white shadow-premium motion-btn",
              "hover:bg-studio-slate disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {loading || success ? (
                <motion.span
                  key="busy"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={transitionFast}
                  className="inline-flex items-center justify-center gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {success ? "Вход выполнен…" : "Проверка…"}
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={transitionFast}
                >
                  Войти
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </form>
      </GlassCard>
    </motion.div>
  );
}

const inputClass = cn(
  "w-full rounded-2xl border border-white/70 bg-white/80 py-3 pl-11 pr-4 text-sm text-studio-charcoal shadow-sm",
  "placeholder:text-neutral-400 outline-none transition-colors",
  "focus:border-studio-accent/40 focus:ring-2 focus:ring-studio-accent/15",
  "disabled:cursor-not-allowed disabled:opacity-60"
);
