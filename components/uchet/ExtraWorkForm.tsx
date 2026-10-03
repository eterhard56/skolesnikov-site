"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Banknote } from "lucide-react";
import { formatMoney } from "@/lib/uchet/calc";
import { useUchet } from "@/lib/uchet/store";

export function ExtraWorkForm() {
  const { addExtra, selectedWorker } = useUchet();
  const [title, setTitle] = useState("");
  const [amountRaw, setAmountRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  const amount = parseAmount(amountRaw);
  const preview = amount !== null && amount > 0 ? amount : null;

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(false), 700);
    return () => clearTimeout(t);
  }, [flash]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedWorker) {
      setError("Сначала добавьте рабочего");
      return;
    }
    if (!title.trim()) {
      setError("Укажите название работы");
      titleRef.current?.focus();
      return;
    }
    if (amount === null || amount <= 0) {
      setError("Сумма: положительное число в рублях");
      return;
    }

    addExtra({ title: title.trim(), amount });
    setTitle("");
    setAmountRaw("");
    setError(null);
    setFlash(true);
    titleRef.current?.focus();
  }

  return (
    <motion.form
      onSubmit={submit}
      layout
      className={`relative overflow-hidden rounded-2xl border border-uchet-line bg-white/80 p-4 shadow-[0_12px_40px_-24px_rgba(15,36,48,0.35)] backdrop-blur-sm sm:p-5 ${
        flash ? "ring-2 ring-uchet-teal/50" : ""
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-uchet-ink">
            Доп. работа
          </p>
          <p className="mt-0.5 text-sm text-uchet-muted">
            Переделка, металл, выезд — название и сумма в ₽
          </p>
        </div>
        {preview !== null && (
          <div className="rounded-xl bg-uchet-ember/10 px-3 py-2 text-right">
            <p className="text-[10px] uppercase tracking-wider text-uchet-ember">
              к зарплате
            </p>
            <p className="font-display text-base font-semibold tabular-nums text-uchet-ember">
              +{formatMoney(preview)}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-uchet-muted">
            Название
          </span>
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Переделка створки, металл…"
            className="uchet-input"
            autoComplete="off"
            enterKeyHint="next"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-uchet-muted">
            Сумма · ₽
          </span>
          <div className="relative">
            <input
              value={amountRaw}
              onChange={(e) => setAmountRaw(e.target.value)}
              placeholder="0"
              inputMode="decimal"
              className="uchet-input pr-9"
              autoComplete="off"
              enterKeyHint="done"
            />
            <Banknote
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-uchet-muted/50"
              aria-hidden
            />
          </div>
        </label>
      </div>

      {error && (
        <p className="mt-3 text-sm text-uchet-ember" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-uchet-ember/30 bg-uchet-ember/10 px-4 py-3.5 text-sm font-semibold text-uchet-ember transition hover:bg-uchet-ember/15 active:scale-[0.99] sm:py-3"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Добавить доп. работу
      </button>
    </motion.form>
  );
}

function parseAmount(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s+/g, "").replace(",", ".");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}
