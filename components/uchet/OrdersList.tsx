"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import {
  calcOrderPay,
  formatArea,
  formatInt,
  formatMoney,
  parseAreaExpression,
} from "@/lib/uchet/calc";
import type { Order } from "@/lib/uchet/types";
import { useUchet } from "@/lib/uchet/store";

export function OrdersList() {
  const { filteredOrders, state, totals, ready } = useUchet();

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
          Добавьте заказ сверху — таблица будет как в тетрадке, строки можно
          править прямо здесь.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-uchet-line bg-white/90 shadow-[0_12px_40px_-28px_rgba(15,36,48,0.3)]">
      <div className="flex items-center justify-between border-b border-uchet-line bg-uchet-paper/90 px-3 py-2.5 sm:px-4">
        <p className="font-display text-sm font-semibold text-uchet-ink">
          Таблица заказов
        </p>
        <p className="text-[11px] text-uchet-muted">Нажмите ячейку, чтобы изменить</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-uchet-line bg-uchet-paper/50 text-[10px] font-semibold uppercase tracking-[0.14em] text-uchet-muted">
              <th className="w-8 px-2 py-2.5 text-left font-semibold">№</th>
              <th className="px-2 py-2.5 text-left font-semibold">N</th>
              <th className="px-2 py-2.5 text-right font-semibold">S</th>
              <th className="px-2 py-2.5 text-right font-semibold">М/С</th>
              <th className="px-2 py-2.5 text-right font-semibold">Доп</th>
              <th className="w-10 px-1 py-2.5" />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {filteredOrders.map((order, index) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  index={index + 1}
                  rates={state.rates}
                />
              ))}
            </AnimatePresence>
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-uchet-ember/40 bg-uchet-ember/[0.04]">
              <td colSpan={2} className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-uchet-ember">
                Итого S
              </td>
              <td className="px-2 py-3 text-right font-display text-lg font-semibold tabular-nums text-uchet-ember">
                {formatArea(totals.area)}
              </td>
              <td className="px-2 py-3 text-right tabular-nums text-uchet-ink">
                {totals.nets > 0 ? formatInt(totals.nets) : "—"}
              </td>
              <td className="px-2 py-3 text-right tabular-nums text-uchet-ink">
                {totals.locks > 0 ? formatInt(totals.locks) : "—"}
              </td>
              <td />
            </tr>
            <tr>
              <td
                colSpan={6}
                className="px-3 pb-3 text-right text-xs text-uchet-muted"
              >
                к выплате {formatMoney(totals.salary)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function OrderRow({
  order,
  index,
  rates,
}: {
  order: Order;
  index: number;
  rates: { sqm: number; lock: number; net: number };
}) {
  const { updateOrder, removeOrder } = useUchet();
  const [number, setNumber] = useState(order.orderNumber);
  const [areaRaw, setAreaRaw] = useState(formatArea(order.area));
  const [nets, setNets] = useState(String(order.nets));
  const [locks, setLocks] = useState(String(order.locks));
  const pay = calcOrderPay(order, rates);

  useEffect(() => {
    setNumber(order.orderNumber);
    setAreaRaw(formatArea(order.area));
    setNets(String(order.nets));
    setLocks(String(order.locks));
  }, [order.id, order.orderNumber, order.area, order.nets, order.locks]);

  function commitNumber() {
    const next = number.trim();
    if (!next || next === order.orderNumber) {
      setNumber(order.orderNumber);
      return;
    }
    updateOrder(order.id, { orderNumber: next });
  }

  function commitArea() {
    const parsed = parseAreaExpression(areaRaw);
    if (parsed === null || parsed <= 0) {
      setAreaRaw(formatArea(order.area));
      return;
    }
    if (parsed !== order.area) {
      updateOrder(order.id, { area: parsed });
    }
    setAreaRaw(formatArea(parsed));
  }

  function commitNets() {
    const n = Math.max(0, Math.floor(Number(nets) || 0));
    setNets(String(n));
    if (n !== order.nets) updateOrder(order.id, { nets: n });
  }

  function commitLocks() {
    const n = Math.max(0, Math.floor(Number(locks) || 0));
    setLocks(String(n));
    if (n !== order.locks) updateOrder(order.id, { locks: n });
  }

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="border-b border-uchet-line/70 odd:bg-white even:bg-uchet-paper/30"
    >
      <td className="px-2 py-1.5 align-middle text-[11px] tabular-nums text-uchet-muted">
        {index}
      </td>
      <td className="px-1 py-1 align-middle">
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          onBlur={commitNumber}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="uchet-cell-input w-full min-w-[4.5rem] font-medium"
          aria-label="Номер заказа"
        />
        <p className="px-1.5 text-[10px] tabular-nums text-uchet-muted">
          {formatMoney(pay.total)}
        </p>
      </td>
      <td className="px-1 py-1 align-middle">
        <input
          value={areaRaw}
          onChange={(e) => setAreaRaw(e.target.value)}
          onBlur={commitArea}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          inputMode="decimal"
          className="uchet-cell-input w-full text-right font-display font-semibold tabular-nums"
          aria-label="Площадь м²"
        />
      </td>
      <td className="px-1 py-1 align-middle">
        <input
          value={nets}
          onChange={(e) => setNets(e.target.value)}
          onBlur={commitNets}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          inputMode="numeric"
          className="uchet-cell-input w-full text-right tabular-nums"
          aria-label="Москитные сетки"
        />
      </td>
      <td className="px-1 py-1 align-middle">
        <input
          value={locks}
          onChange={(e) => setLocks(e.target.value)}
          onBlur={commitLocks}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          inputMode="numeric"
          className="uchet-cell-input w-full text-right tabular-nums"
          aria-label="Замки"
        />
      </td>
      <td className="px-1 py-1 align-middle">
        <button
          type="button"
          onClick={() => {
            if (confirm(`Удалить заказ «${order.orderNumber}»?`)) {
              removeOrder(order.id);
            }
          }}
          className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-uchet-muted hover:bg-uchet-ember/10 hover:text-uchet-ember"
          aria-label={`Удалить ${order.orderNumber}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </motion.tr>
  );
}
