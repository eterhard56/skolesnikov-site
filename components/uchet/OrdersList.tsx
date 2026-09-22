"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import {
  calcOrderPay,
  formatArea,
  formatInt,
  formatMoney,
} from "@/lib/uchet/calc";
import { useUchet } from "@/lib/uchet/store";

export function OrdersList() {
  const { filteredOrders, state, removeOrder, ready } = useUchet();

  if (!ready) {
    return (
      <div className="rounded-2xl border border-dashed border-uchet-line p-8 text-center text-sm text-uchet-muted">
        Загрузка…
      </div>
    );
  }

  if (filteredOrders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-uchet-line bg-white/40 px-6 py-12 text-center">
        <p className="font-display text-lg font-semibold text-uchet-ink">
          Пока пусто
        </p>
        <p className="mt-2 text-sm text-uchet-muted">
          Добавьте первый заказ — итоговая сумма появится сразу внизу экрана.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-uchet-line bg-white/75 shadow-[0_12px_40px_-28px_rgba(15,36,48,0.3)]">
      <div className="grid grid-cols-[minmax(0,1.2fr)_0.7fr_0.55fr_0.55fr_auto] gap-2 border-b border-uchet-line bg-uchet-paper/80 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-uchet-muted sm:px-4">
        <span>N</span>
        <span className="text-right">S</span>
        <span className="text-right">М/С</span>
        <span className="text-right">Доп</span>
        <span className="w-8" />
      </div>

      <ul className="divide-y divide-uchet-line/70">
        <AnimatePresence initial={false}>
          {filteredOrders.map((order) => {
            const pay = calcOrderPay(order, state.rates);
            return (
              <motion.li
                key={order.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 24, height: 0 }}
                transition={{ duration: 0.22 }}
                className="group grid grid-cols-[minmax(0,1.2fr)_0.7fr_0.55fr_0.55fr_auto] items-center gap-2 px-3 py-3 sm:px-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-uchet-ink">
                    {order.orderNumber}
                  </p>
                  <p className="text-[11px] tabular-nums text-uchet-muted">
                    {formatMoney(pay.total)}
                  </p>
                </div>
                <p className="text-right font-display text-sm font-semibold tabular-nums text-uchet-ink">
                  {formatArea(order.area)}
                </p>
                <p className="text-right tabular-nums text-sm text-uchet-ink">
                  {order.nets > 0 ? formatInt(order.nets) : "—"}
                </p>
                <p className="text-right tabular-nums text-sm text-uchet-ink">
                  {order.locks > 0 ? (
                    <span>
                      {formatInt(order.locks)}{" "}
                      <span className="text-[10px] text-uchet-muted">зам.</span>
                    </span>
                  ) : (
                    "—"
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => removeOrder(order.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-uchet-muted transition hover:bg-uchet-ember/10 hover:text-uchet-ember"
                  aria-label={`Удалить заказ ${order.orderNumber}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
