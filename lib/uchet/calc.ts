import type { Order, Rates } from "./types";

export interface Totals {
  area: number;
  nets: number;
  locks: number;
  fromArea: number;
  fromNets: number;
  fromLocks: number;
  salary: number;
  orderCount: number;
}

export function emptyTotals(): Totals {
  return {
    area: 0,
    nets: 0,
    locks: 0,
    fromArea: 0,
    fromNets: 0,
    fromLocks: 0,
    salary: 0,
    orderCount: 0,
  };
}

export function calcOrderPay(order: Pick<Order, "area" | "nets" | "locks">, rates: Rates) {
  const fromArea = roundMoney(order.area * rates.sqm);
  const fromNets = roundMoney(order.nets * rates.net);
  const fromLocks = roundMoney(order.locks * rates.lock);
  return {
    fromArea,
    fromNets,
    fromLocks,
    total: roundMoney(fromArea + fromNets + fromLocks),
  };
}

export function sumOrders(orders: Order[], rates: Rates): Totals {
  return orders.reduce<Totals>((acc, order) => {
    const pay = calcOrderPay(order, rates);
    acc.area = roundArea(acc.area + order.area);
    acc.nets += order.nets;
    acc.locks += order.locks;
    acc.fromArea = roundMoney(acc.fromArea + pay.fromArea);
    acc.fromNets = roundMoney(acc.fromNets + pay.fromNets);
    acc.fromLocks = roundMoney(acc.fromLocks + pay.fromLocks);
    acc.salary = roundMoney(acc.salary + pay.total);
    acc.orderCount += 1;
    return acc;
  }, emptyTotals());
}

export function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function roundArea(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Parse "8,71" or "8.71+1.57" style area expressions from the notebook. */
export function parseAreaExpression(raw: string): number | null {
  const cleaned = raw
    .trim()
    .replace(/\s+/g, "")
    .replace(/,/g, ".")
    .replace(/[×xX]/g, "*");

  if (!cleaned) return null;
  if (!/^[\d.+\-*/()]+$/.test(cleaned)) return null;

  try {
    // Safe arithmetic-only eval via Function
    // eslint-disable-next-line no-new-func
    const value = Function(`"use strict"; return (${cleaned})`)() as unknown;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      return null;
    }
    return roundArea(value);
  } catch {
    return null;
  }
}

export function formatMoney(n: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function formatArea(n: number): string {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatInt(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(n);
}
