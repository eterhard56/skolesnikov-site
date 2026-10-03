"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/uchet/calc";
import type { ExtraWork } from "@/lib/uchet/types";
import { useUchet } from "@/lib/uchet/store";

export function ExtraWorksList() {
  const { filteredExtras, ready } = useUchet();

  if (!ready) return null;

  if (filteredExtras.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-uchet-line bg-white/40 px-5 py-8 text-center">
        <p className="font-display text-base font-semibold text-uchet-ink">
          Доп. работ пока нет
        </p>
        <p className="mt-1.5 text-sm text-uchet-muted">
          Добавьте работу с суммой — она войдёт в общий пул зарплаты цеха.
        </p>
      </div>
    );
  }

  const sum = filteredExtras.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-uchet-line bg-white/90 shadow-[0_12px_40px_-28px_rgba(15,36,48,0.3)]">
      <div className="flex items-center justify-between border-b border-uchet-line bg-uchet-paper/90 px-3 py-2.5 sm:px-4">
        <p className="font-display text-sm font-semibold text-uchet-ink">
          Доп. работы
        </p>
        <p className="text-[11px] tabular-nums text-uchet-muted">
          {filteredExtras.length} шт · {formatMoney(sum)}
        </p>
      </div>

      <ul className="divide-y divide-uchet-line/70">
        <AnimatePresence initial={false}>
          {filteredExtras.map((extra) => (
            <ExtraRow key={extra.id} extra={extra} />
          ))}
        </AnimatePresence>
      </ul>

      <div className="flex items-center justify-between border-t-2 border-uchet-ember/40 bg-uchet-ember/[0.04] px-3 py-3 sm:px-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-uchet-ember">
          Итого доп.
        </p>
        <p className="font-display text-lg font-semibold tabular-nums text-uchet-ember">
          {formatMoney(sum)}
        </p>
      </div>
    </div>
  );
}

function ExtraRow({ extra }: { extra: ExtraWork }) {
  const { updateExtra, removeExtra } = useUchet();
  const [title, setTitle] = useState(extra.title);
  const [amountRaw, setAmountRaw] = useState(String(extra.amount));

  useEffect(() => {
    setTitle(extra.title);
    setAmountRaw(String(extra.amount));
  }, [extra.id, extra.title, extra.amount]);

  function commitTitle() {
    const next = title.trim();
    if (!next || next === extra.title) {
      setTitle(extra.title);
      return;
    }
    updateExtra(extra.id, { title: next });
  }

  function commitAmount() {
    const cleaned = amountRaw.trim().replace(/\s+/g, "").replace(",", ".");
    const n = Number(cleaned);
    if (!Number.isFinite(n) || n <= 0) {
      setAmountRaw(String(extra.amount));
      return;
    }
    const rounded = Math.round(n * 100) / 100;
    setAmountRaw(String(rounded));
    if (rounded !== extra.amount) {
      updateExtra(extra.id, { amount: rounded });
    }
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2 px-2 py-2 sm:px-3"
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={commitTitle}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="uchet-cell-input min-w-0 flex-1 font-medium"
        aria-label="Название доп. работы"
      />
      <input
        value={amountRaw}
        onChange={(e) => setAmountRaw(e.target.value)}
        onBlur={commitAmount}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        inputMode="decimal"
        className="uchet-cell-input w-24 shrink-0 text-right font-display font-semibold tabular-nums sm:w-28"
        aria-label="Сумма в рублях"
      />
      <span className="shrink-0 text-[11px] text-uchet-muted">₽</span>
      <button
        type="button"
        onClick={() => {
          if (confirm(`Удалить «${extra.title}»?`)) {
            removeExtra(extra.id);
          }
        }}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-uchet-muted hover:bg-uchet-ember/10 hover:text-uchet-ember"
        aria-label={`Удалить ${extra.title}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.li>
  );
}
