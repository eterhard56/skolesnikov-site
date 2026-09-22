export type UchetTab =
  | "orders"
  | "attendance"
  | "salary"
  | "workers"
  | "rates";

export interface Rates {
  sqm: number;
  lock: number;
  net: number;
}

export interface Worker {
  id: string;
  name: string;
  createdAt: string;
}

export interface Order {
  id: string;
  workerId: string;
  /** Month key YYYY-MM */
  monthKey: string;
  orderNumber: string;
  /** Square meters */
  area: number;
  nets: number;
  locks: number;
  note?: string;
  createdAt: string;
}

/** @deprecated kept for migration from older localStorage */
export type AttendanceStatus = "present" | "absent" | "half" | "off";

export interface AttendanceDay {
  workerId: string;
  /** YYYY-MM-DD */
  date: string;
  /** Worked hours that day (0 = clear / not worked) */
  hours: number;
}

export interface UchetState {
  version: 2;
  rates: Rates;
  workers: Worker[];
  orders: Order[];
  attendance: AttendanceDay[];
  selectedWorkerId: string | null;
  selectedMonthKey: string;
}

export const DEFAULT_RATES: Rates = {
  sqm: 440,
  lock: 300,
  net: 150,
};

/** Default full shift when migrating old «явка» marks */
export const DEFAULT_SHIFT_HOURS = 8;
