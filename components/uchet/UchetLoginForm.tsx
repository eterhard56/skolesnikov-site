"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Lock, User } from "lucide-react";
import { UCHET_DASHBOARD_PATH } from "@/lib/uchet/auth-routes";

export function UchetLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/uchet/login", {
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

      const from = searchParams.get("from") || UCHET_DASHBOARD_PATH;
      router.push(from);
      router.refresh();
    } catch {
      setError("Ошибка сети. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="uchet-shell relative flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="uchet-grid-bg pointer-events-none absolute inset-0" aria-hidden />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm"
      >
        <p className="text-center font-display text-[11px] font-semibold uppercase tracking-[0.28em] text-uchet-teal">
          ПВХ · цех
        </p>
        <h1 className="mt-2 text-center font-display text-3xl font-semibold text-uchet-ink">
          ЦехУчёт
        </h1>
        <p className="mt-2 text-center text-sm text-uchet-muted">
          Вход для сотрудников цеха
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-2xl border border-uchet-line bg-white/85 p-5 shadow-lg backdrop-blur sm:p-6"
        >
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-uchet-muted">
              Логин
            </span>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-uchet-muted/60" />
              <input
                type="text"
                autoComplete="username"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="uchet-input pl-10"
                placeholder="Логин"
                disabled={loading}
                required
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-uchet-muted">
              Пароль
            </span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-uchet-muted/60" />
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="uchet-input pl-10"
                placeholder="Пароль"
                disabled={loading}
                required
              />
            </div>
          </label>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-uchet-ember/25 bg-uchet-ember/5 px-3 py-2 text-sm text-uchet-ember"
                role="alert"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-uchet-ink px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-uchet-ink/90 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Проверка…
              </>
            ) : (
              "Войти"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
