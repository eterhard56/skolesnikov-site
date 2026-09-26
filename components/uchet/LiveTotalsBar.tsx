"use client";

import { motion, AnimatePresence } from "framer-motion";
import { formatArea, formatInt, formatMoney } from "@/lib/uchet/calc";
import { useUchet } from "@/lib/uchet/store";

export function LiveTotalsBar() {
  const {
    totals,
    shopTotals,
    shop,
    state,
    monthHours,
    monthRubPerHour,
    workerPay,
    selectedWorker,
    ready,
  } = useUchet();

  if (!ready) return null;

  // Orders tab: selected worker's orders. Salary: shop pool.
  const showShop = true;
  const display = showShop ? shopTotals : totals;
  const hoursHint =
    shop.totalHours > 0
      ? `${formatArea(shop.totalHours)} ч цех`
      : "нет часов";

  return (
    <motion.aside
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="uchet-totals fixed inset-x-0 bottom-0 z-40 border-t border-uchet-line/80 bg-uchet-ink/95 text-uchet-paper backdrop-blur-xl"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:px-6">
        <div className="grid flex-1 grid-cols-4 gap-2 text-center sm:text-left">
          <Stat
            label="м²"
            value={formatArea(display.area)}
            hint={formatMoney(display.fromArea)}
          />
          <Stat
            label="сетки"
            value={formatInt(display.nets)}
            hint={formatMoney(display.fromNets)}
          />
          <Stat
            label="замки"
            value={formatInt(display.locks)}
            hint={formatMoney(display.fromLocks)}
          />
          <Stat
            label="₽/час"
            value={shop.totalHours > 0 ? formatMoney(monthRubPerHour) : "—"}
            hint={
              selectedWorker && monthHours > 0
                ? `${formatArea(monthHours)} ч · ${formatMoney(workerPay)}`
                : hoursHint
            }
          />
        </div>

        <div className="flex items-baseline justify-between gap-3 border-t border-white/10 pt-3 sm:block sm:border-0 sm:pt-0 sm:text-right">
          <p className="text-[11px] uppercase tracking-[0.18em] text-uchet-mist/70">
            Работы цеха · {display.orderCount} зак.
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={display.salary}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className="font-display text-3xl font-semibold tracking-tight text-uchet-ember sm:text-4xl"
            >
              {formatMoney(display.salary)}
            </motion.p>
          </AnimatePresence>
          <p className="mt-0.5 hidden text-[11px] text-uchet-mist/55 sm:block">
            {state.rates.sqm}₽/м² · {state.rates.lock}₽ замок · {state.rates.net}₽
            сетка
          </p>
        </div>
      </div>
    </motion.aside>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.16em] text-uchet-mist/55">
        {label}
      </p>
      <AnimatePresence mode="wait">
        <motion.p
          key={value}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-base font-semibold tabular-nums text-white sm:text-lg"
        >
          {value}
        </motion.p>
      </AnimatePresence>
      <p className="text-[10px] tabular-nums text-uchet-mist/45 sm:text-[11px]">
        {hint}
      </p>
    </div>
  );
}
