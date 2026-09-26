import {
  calcOrderPay,
  emptyTotals,
  roundMoney,
  sumOrders,
  type Totals,
} from "./calc";
import type {
  AttendanceDay,
  MonthHoursMap,
  Order,
  Rates,
  Worker,
} from "./types";
import { monthHoursKey } from "./types";

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

export function resolveMonthHours(
  workerId: string,
  monthKey: string,
  attendance: AttendanceDay[],
  monthHours: MonthHoursMap
): number {
  const key = monthHoursKey(workerId, monthKey);
  if (Object.prototype.hasOwnProperty.call(monthHours, key)) {
    const override = monthHours[key];
    if (Number.isFinite(override) && override >= 0) {
      return roundMoney(override);
    }
  }
  const monthDays = attendance.filter(
    (a) => a.workerId === workerId && a.date.startsWith(monthKey)
  );
  return sumHours(monthDays);
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
  monthKey: string,
  monthHours: MonthHoursMap = {}
): WorkerSalary {
  const monthOrders = orders.filter(
    (o) => o.workerId === worker.id && o.monthKey === monthKey
  );
  const totals = sumOrders(monthOrders, rates);
  const hours = resolveMonthHours(
    worker.id,
    monthKey,
    attendance,
    monthHours
  );
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
  monthKey: string,
  monthHours: MonthHoursMap = {}
): WorkerSalary[] {
  return workers.map((w) =>
    workerSalary(w, orders, attendance, rates, monthKey, monthHours)
  );
}

export { emptyTotals, calcOrderPay };
