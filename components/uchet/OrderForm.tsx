"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Calculator } from "lucide-react";
import { parseAreaExpression, calcOrderPay, formatMoney } from "@/lib/uchet/calc";
import { useUchet } from "@/lib/uchet/store";

export function OrderForm() {
  const { addOrder, state, selectedWorker } = useUchet();
  const [orderNumber, setOrderNumber] = useState("");
  const [areaRaw, setAreaRaw] = useState("");
  const [nets, setNets] = useState("0");
  const [locks, setLocks] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const numberRef = useRef<HTMLInputElement>(null);

  const area = parseAreaExpression(areaRaw);
  const netsN = Math.max(0, Math.floor(Number(nets) || 0));
  const locksN = Math.max(0, Math.floor(Number(locks) || 0));
  const preview =
    area !== null
      ? calcOrderPay({ area, nets: netsN, locks: locksN }, state.rates)
      : null;

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
    if (!orderNumber.trim()) {
      setError("Укажите номер заказа");
      numberRef.current?.focus();
      return;
    }
    if (area === null || area <= 0) {
      setError("Площадь: число или выражение, например 8,71+1,57");
      return;
    }

    addOrder({
      orderNumber: orderNumber.trim(),
      area,
      nets: netsN,
      locks: locksN,
    });

    setOrderNumber("");
    setAreaRaw("");
    setNets("0");
    setLocks("0");
    setError(null);
    setFlash(true);
    numberRef.current?.focus();
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
            Новый заказ
          </p>
          <p className="mt-0.5 text-sm text-uchet-muted">
            Как в тетрадке: № · S · М/С · доп.
          </p>
        </div>
        {preview && (
          <div className="rounded-xl bg-uchet-teal/10 px-3 py-2 text-right">
            <p className="text-[10px] uppercase tracking-wider text-uchet-teal">
              к зарплате
            </p>
            <p className="font-display text-base font-semibold tabular-nums text-uchet-teal">
              +{formatMoney(preview.total)}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="N · номер" className="col-span-2 sm:col-span-1">
          <input
            ref={numberRef}
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="475/2 или С-15"
            className="uchet-input"
            autoComplete="off"
            enterKeyHint="next"
          />
        </Field>

        <Field
          label="S · м²"
          hint="можно 8,71+1,57"
          className="col-span-2 sm:col-span-1"
        >
          <div className="relative">
            <input
              value={areaRaw}
              onChange={(e) => setAreaRaw(e.target.value)}
              placeholder="0,00"
              inputMode="decimal"
              className="uchet-input pr-9"
              autoComplete="off"
            />
            <Calculator
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-uchet-muted/50"
              aria-hidden
            />
          </div>
        </Field>

        <Field label="М/С · сетки">
          <input
            value={nets}
            onChange={(e) => setNets(e.target.value)}
            inputMode="numeric"
            className="uchet-input"
            autoComplete="off"
          />
        </Field>

        <Field label="Доп · замки">
          <input
            value={locks}
            onChange={(e) => setLocks(e.target.value)}
            inputMode="numeric"
            className="uchet-input"
            autoComplete="off"
          />
        </Field>
      </div>

      {error && (
        <p className="mt-3 text-sm text-uchet-ember" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-uchet-ink px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-uchet-ink/90 active:scale-[0.99] sm:py-3"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Добавить заказ
      </button>
    </motion.form>
  );
}

function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-uchet-muted">
          {label}
        </span>
        {hint && <span className="text-[10px] text-uchet-muted/70">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
