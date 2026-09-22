import {
  calcOrderPay,
  emptyTotals,
  roundMoney,
  sumOrders,
  type Totals,
} from "./calc";
import type { AttendanceDay, Order, Rates, Worker } from "./types";

export interface WorkerSalary {
  worker: Worker;
  totals: Totals;
  hours: number;
  /** ₽ per hour = piecework / hours (0 if no hours) */
  rubPerHour: number;
}

export function sumHours(days: AttendanceDay[]): number {
  return roundMoney(
    days.reduce((acc, d) => acc + (Number.isFinite(d.hours) ? d.hours : 0), 0)
  );
}

export function rubPerHour(piecework: number, hours: number): number {
  if (!hours || hours <= 0) return 0;
  return roundMoney(piecework / hours);
}

export function workerSalary(
  worker: Worker,
  orders: Order[],
  attendance: AttendanceDay[],
  rates: Rates,
  monthKey: string
): WorkerSalary {
  const monthOrders = orders.filter(
    (o) => o.workerId === worker.id && o.monthKey === monthKey
  );
  const monthDays = attendance.filter(
    (a) => a.workerId === worker.id && a.date.startsWith(monthKey)
  );
  const totals = sumOrders(monthOrders, rates);
  const hours = sumHours(monthDays);
  return {
    worker,
    totals,
    hours,
    rubPerHour: rubPerHour(totals.salary, hours),
  };
}

export function allWorkersSalary(
  workers: Worker[],
  orders: Order[],
  attendance: AttendanceDay[],
  rates: Rates,
  monthKey: string
): WorkerSalary[] {
  return workers.map((w) =>
    workerSalary(w, orders, attendance, rates, monthKey)
  );
}

export { emptyTotals, calcOrderPay };
