import {
  DEFAULT_RATES,
  type AttendanceDay,
  type Order,
  type Rates,
  type UchetState,
  type Worker,
} from "./types";
import { currentMonthKey } from "./months";

export const UCHET_STORAGE_KEY = "uchet-pvh-v1";

export function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function createInitialState(): UchetState {
  const worker: Worker = {
    id: createId("w"),
    name: "Рабочий 1",
    createdAt: new Date().toISOString(),
  };

  return {
    version: 1,
    rates: { ...DEFAULT_RATES },
    workers: [worker],
    orders: [],
    attendance: [],
    selectedWorkerId: worker.id,
    selectedMonthKey: currentMonthKey(),
  };
}

export function loadState(): UchetState {
  if (typeof window === "undefined") return createInitialState();

  try {
    const raw = localStorage.getItem(UCHET_STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<UchetState>;
    return normalizeState(parsed);
  } catch {
    return createInitialState();
  }
}

export function saveState(state: UchetState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(UCHET_STORAGE_KEY, JSON.stringify(state));
}

function normalizeState(parsed: Partial<UchetState>): UchetState {
  const base = createInitialState();
  const rates: Rates = {
    sqm: Number(parsed.rates?.sqm) || DEFAULT_RATES.sqm,
    lock: Number(parsed.rates?.lock) || DEFAULT_RATES.lock,
    net: Number(parsed.rates?.net) || DEFAULT_RATES.net,
  };

  const workers = Array.isArray(parsed.workers) && parsed.workers.length > 0
    ? parsed.workers.filter(isWorker)
    : base.workers;

  const orders = Array.isArray(parsed.orders)
    ? parsed.orders.filter(isOrder)
    : [];

  const attendance = Array.isArray(parsed.attendance)
    ? parsed.attendance.filter(isAttendance)
    : [];

  const selectedWorkerId =
    workers.find((w) => w.id === parsed.selectedWorkerId)?.id ?? workers[0]?.id ?? null;

  return {
    version: 1,
    rates,
    workers,
    orders,
    attendance,
    selectedWorkerId,
    selectedMonthKey:
      typeof parsed.selectedMonthKey === "string" && /^\d{4}-\d{2}$/.test(parsed.selectedMonthKey)
        ? parsed.selectedMonthKey
        : currentMonthKey(),
  };
}

function isWorker(v: unknown): v is Worker {
  if (!v || typeof v !== "object") return false;
  const w = v as Worker;
  return typeof w.id === "string" && typeof w.name === "string";
}

function isOrder(v: unknown): v is Order {
  if (!v || typeof v !== "object") return false;
  const o = v as Order;
  return (
    typeof o.id === "string" &&
    typeof o.workerId === "string" &&
    typeof o.monthKey === "string" &&
    typeof o.orderNumber === "string" &&
    typeof o.area === "number" &&
    typeof o.nets === "number" &&
    typeof o.locks === "number"
  );
}

function isAttendance(v: unknown): v is AttendanceDay {
  if (!v || typeof v !== "object") return false;
  const a = v as AttendanceDay;
  return (
    typeof a.workerId === "string" &&
    typeof a.date === "string" &&
    (a.status === "present" || a.status === "absent" || a.status === "half" || a.status === "off")
  );
}

export function exportStateJson(state: UchetState): string {
  return JSON.stringify(state, null, 2);
}

export function importStateJson(raw: string): UchetState {
  const parsed = JSON.parse(raw) as Partial<UchetState>;
  return normalizeState(parsed);
}
