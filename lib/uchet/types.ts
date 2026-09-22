export type UchetTab = "orders" | "attendance" | "workers" | "rates";

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

export type AttendanceStatus = "present" | "absent" | "half" | "off";

export interface AttendanceDay {
  workerId: string;
  /** YYYY-MM-DD */
  date: string;
  status: AttendanceStatus;
}

export interface UchetState {
  version: 1;
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
