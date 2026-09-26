import {
  DEFAULT_RATES,
  DEFAULT_SHIFT_HOURS,
  type AttendanceDay,
  type AttendanceStatus,
  type MonthHoursMap,
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
  return {
    version: 3,
    rates: { ...DEFAULT_RATES },
    workers: [],
    orders: [],
    attendance: [],
    monthHours: {},
    removedOrderIds: [],
    removedWorkerIds: [],
    selectedWorkerId: null,
    selectedMonthKey: currentMonthKey(),
  };
}

export function loadState(): UchetState {
  if (typeof window === "undefined") return createInitialState();

  try {
    const raw = localStorage.getItem(UCHET_STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<UchetState> & {
      attendance?: Array<Partial<AttendanceDay> & { status?: AttendanceStatus }>;
    };
    return normalizeState(parsed);
  } catch {
    return createInitialState();
  }
}

export function saveState(state: UchetState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(UCHET_STORAGE_KEY, JSON.stringify(state));
}

function statusToHours(status: AttendanceStatus | undefined): number {
  switch (status) {
    case "present":
      return DEFAULT_SHIFT_HOURS;
    case "half":
      return DEFAULT_SHIFT_HOURS / 2;
    case "absent":
    case "off":
    default:
      return 0;
  }
}

function normalizeAttendance(
  raw: Array<Partial<AttendanceDay> & { status?: AttendanceStatus }>
): AttendanceDay[] {
  const result: AttendanceDay[] = [];
  for (const item of raw) {
    if (typeof item.workerId !== "string" || typeof item.date !== "string") {
      continue;
    }
    let hours =
      typeof item.hours === "number" && Number.isFinite(item.hours)
        ? item.hours
        : statusToHours(item.status);
    hours = Math.max(0, Math.min(24, Math.round(hours * 100) / 100));
    if (hours <= 0) continue;
    result.push({ workerId: item.workerId, date: item.date, hours });
  }
  return result;
}

function normalizeState(
  parsed: Partial<UchetState> & {
    attendance?: Array<Partial<AttendanceDay> & { status?: AttendanceStatus }>;
  }
): UchetState {
  const rates: Rates = {
    sqm: Number(parsed.rates?.sqm) || DEFAULT_RATES.sqm,
    lock: Number(parsed.rates?.lock) || DEFAULT_RATES.lock,
    net: Number(parsed.rates?.net) || DEFAULT_RATES.net,
  };

  const monthHours = normalizeMonthHours(
    (parsed as Partial<UchetState>).monthHours
  );

  const removedOrderIds = normalizeIdList(
    (parsed as Partial<UchetState>).removedOrderIds
  );
  const removedWorkerIds = normalizeIdList(
    (parsed as Partial<UchetState>).removedWorkerIds
  );

  const workers = Array.isArray(parsed.workers)
    ? parsed.workers.filter(isWorker).filter((w) => !removedWorkerIds.includes(w.id))
    : [];

  const orders = Array.isArray(parsed.orders)
    ? parsed.orders
        .filter(isOrder)
        .filter(
          (o) =>
            !removedOrderIds.includes(o.id) &&
            !removedWorkerIds.includes(o.workerId)
        )
    : [];

  const attendance = Array.isArray(parsed.attendance)
    ? normalizeAttendance(parsed.attendance).filter(
        (a) => !removedWorkerIds.includes(a.workerId)
      )
    : [];

  const selectedWorkerId =
    workers.find((w) => w.id === parsed.selectedWorkerId)?.id ??
    workers[0]?.id ??
    null;

  return {
    version: 3,
    rates,
    workers,
    orders,
    attendance,
    monthHours,
    removedOrderIds,
    removedWorkerIds,
    selectedWorkerId,
    selectedMonthKey:
      typeof parsed.selectedMonthKey === "string" &&
      /^\d{4}-\d{2}$/.test(parsed.selectedMonthKey)
        ? parsed.selectedMonthKey
        : currentMonthKey(),
  };
}

function normalizeIdList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return Array.from(
    new Set(raw.filter((id): id is string => typeof id === "string" && id.length > 0))
  );
}

function normalizeMonthHours(raw: unknown): MonthHoursMap {
  if (!raw || typeof raw !== "object") return {};
  const result: MonthHoursMap = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const n = typeof value === "number" ? value : Number(value);
    if (!key.includes(":") || !Number.isFinite(n) || n < 0) continue;
    result[key] = Math.round(n * 100) / 100;
  }
  return result;
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

export function exportStateJson(state: UchetState): string {
  return JSON.stringify(state, null, 2);
}

export function importStateJson(raw: string): UchetState {
  const parsed = JSON.parse(raw) as Partial<UchetState>;
  return normalizeState(parsed);
}
