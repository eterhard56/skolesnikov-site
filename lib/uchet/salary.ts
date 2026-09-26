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
  /** Personal orders totals (for info) */
  orderTotals: Totals;
  hours: number;
  /** Shop-wide ₽/hour for the month */
  rubPerHour: number;
  /** Pay = hours × shop ₽/hour */
  pay: number;
}

export interface ShopSalary {
  /** All orders in month (any worker) */
  totals: Totals;
  /** Sum of hours across all workers */
  totalHours: number;
  /** totals.salary / totalHours */
  rubPerHour: number;
  workers: WorkerSalary[];
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

export function shopSalary(
  workers: Worker[],
  orders: Order[],
  attendance: AttendanceDay[],
  rates: Rates,
  monthKey: string,
  monthHours: MonthHoursMap = {}
): ShopSalary {
  const monthOrders = orders.filter((o) => o.monthKey === monthKey);
  const totals = sumOrders(monthOrders, rates);

  const workersRows: WorkerSalary[] = workers.map((worker) => {
    const orderTotals = sumOrders(
      monthOrders.filter((o) => o.workerId === worker.id),
      rates
    );
    const hours = resolveMonthHours(
      worker.id,
      monthKey,
      attendance,
      monthHours
    );
    return {
      worker,
      orderTotals,
      hours,
      rubPerHour: 0,
      pay: 0,
    };
  });

  const totalHours = roundMoney(
    workersRows.reduce((acc, row) => acc + row.hours, 0)
  );
  const rate = rubPerHour(totals.salary, totalHours);

  const workersWithPay = workersRows.map((row) => ({
    ...row,
    rubPerHour: rate,
    pay: roundMoney(row.hours * rate),
  }));

  return {
    totals,
    totalHours,
    rubPerHour: rate,
    workers: workersWithPay,
  };
}

/** @deprecated use shopSalary — kept for older imports */
export function workerSalary(
  worker: Worker,
  orders: Order[],
  attendance: AttendanceDay[],
  rates: Rates,
  monthKey: string,
  monthHours: MonthHoursMap = {}
): WorkerSalary {
  const shop = shopSalary(
    [worker],
    orders,
    attendance,
    rates,
    monthKey,
    monthHours
  );
  return (
    shop.workers[0] ?? {
      worker,
      orderTotals: emptyTotals(),
      hours: 0,
      rubPerHour: 0,
      pay: 0,
    }
  );
}

export function allWorkersSalary(
  workers: Worker[],
  orders: Order[],
  attendance: AttendanceDay[],
  rates: Rates,
  monthKey: string,
  monthHours: MonthHoursMap = {}
): WorkerSalary[] {
  return shopSalary(
    workers,
    orders,
    attendance,
    rates,
    monthKey,
    monthHours
  ).workers;
}

export { emptyTotals, calcOrderPay };
