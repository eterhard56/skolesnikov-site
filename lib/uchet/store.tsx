"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { sumOrders, type Totals } from "./calc";
import {
  allWorkersSalary,
  resolveMonthHours,
  rubPerHour,
  type WorkerSalary,
} from "./salary";
import {
  createId,
  createInitialState,
  loadState,
  saveState,
} from "./storage";
import {
  fetchCloudState,
  pushCloudState,
  type SyncStatus,
} from "./sync-client";
import type {
  AttendanceDay,
  Order,
  Rates,
  UchetState,
  Worker,
} from "./types";
import { monthHoursKey } from "./types";

interface UchetContextValue {
  ready: boolean;
  syncStatus: SyncStatus;
  syncError: string | null;
  state: UchetState;
  filteredOrders: Order[];
  totals: Totals;
  selectedWorker: Worker | null;
  monthHours: number;
  /** Hours summed from calendar days only */
  calendarHours: number;
  monthRubPerHour: number;
  workersSalary: WorkerSalary[];
  setMonth: (monthKey: string) => void;
  setWorker: (workerId: string) => void;
  addWorker: (name: string) => void;
  renameWorker: (id: string, name: string) => void;
  removeWorker: (id: string) => void;
  addOrder: (input: {
    orderNumber: string;
    area: number;
    nets: number;
    locks: number;
    note?: string;
  }) => void;
  updateOrder: (
    id: string,
    patch: Partial<Omit<Order, "id" | "createdAt">>
  ) => void;
  removeOrder: (id: string) => void;
  setDayHours: (date: string, hours: number | null) => void;
  getDayHours: (date: string) => number | null;
  /** Set total hours for selected worker + month (manual) */
  setMonthTotalHours: (hours: number | null) => void;
  updateRates: (rates: Rates) => void;
  replaceState: (next: UchetState) => void;
  resetAll: () => void;
  refreshFromCloud: () => Promise<void>;
}

const UchetContext = createContext<UchetContextValue | null>(null);

const SAVE_DEBOUNCE_MS = 700;
const POLL_MS = 25_000;

function mergeRemoteKeepingSelection(
  remote: UchetState,
  local: UchetState
): UchetState {
  const selectedWorkerId =
    remote.workers.find((w) => w.id === local.selectedWorkerId)?.id ??
    remote.selectedWorkerId ??
    remote.workers[0]?.id ??
    null;
  return {
    ...remote,
    monthHours: remote.monthHours ?? {},
    selectedWorkerId,
    selectedMonthKey: local.selectedMonthKey || remote.selectedMonthKey,
  };
}

function businessFingerprint(state: UchetState): string {
  return JSON.stringify({
    rates: state.rates,
    workers: state.workers,
    orders: state.orders,
    attendance: state.attendance,
    monthHours: state.monthHours ?? {},
  });
}

export function UchetProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UchetState>(createInitialState);
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");
  const [syncError, setSyncError] = useState<string | null>(null);

  const skipNextSave = useRef(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cloudUpdatedAt = useRef<string | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const refreshFromCloud = useCallback(async () => {
    try {
      const remote = await fetchCloudState();
      if (remote.state) {
        skipNextSave.current = true;
        setState((local) => mergeRemoteKeepingSelection(remote.state!, local));
        saveState(mergeRemoteKeepingSelection(remote.state, stateRef.current));
        cloudUpdatedAt.current = remote.updatedAt;
      }
      setSyncStatus("saved");
      setSyncError(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "error";
      if (msg === "unauthorized") {
        setSyncStatus("error");
        setSyncError("Нужен вход");
        return;
      }
      setSyncStatus("error");
      setSyncError("Не удалось обновить с сервера");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const local = loadState();
      setState(local);
      setSyncStatus("loading");

      try {
        const remote = await fetchCloudState();
        if (cancelled) return;

        if (remote.state) {
          skipNextSave.current = true;
          const merged = mergeRemoteKeepingSelection(remote.state, local);
          setState(merged);
          saveState(merged);
          cloudUpdatedAt.current = remote.updatedAt;
          setSyncStatus("saved");
          setSyncError(null);
        } else if (
          local.workers.length > 0 ||
          local.orders.length > 0 ||
          local.attendance.length > 0 ||
          Object.keys(local.monthHours ?? {}).length > 0
        ) {
          setSyncStatus("saving");
          const pushed = await pushCloudState(local);
          if (cancelled) return;
          cloudUpdatedAt.current = pushed.updatedAt;
          setSyncStatus("saved");
          setSyncError(null);
        } else {
          setSyncStatus("saved");
          setSyncError(null);
        }
      } catch (error) {
        if (cancelled) return;
        const msg = error instanceof Error ? error.message : "error";
        setSyncStatus(msg === "unauthorized" ? "error" : "offline");
        setSyncError(
          msg === "unauthorized"
            ? "Нужен вход"
            : "Нет связи с сервером — правки пока только на этом телефоне"
        );
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveState(state);

    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSyncStatus("saving");
    setSyncError(null);

    saveTimer.current = setTimeout(async () => {
      try {
        const pushed = await pushCloudState(stateRef.current);
        cloudUpdatedAt.current = pushed.updatedAt;
        setSyncStatus("saved");
        setSyncError(null);
      } catch {
        setSyncStatus("error");
        setSyncError("Не удалось сохранить на сервер");
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, ready]);

  // Pull updates when tab becomes visible / periodically
  useEffect(() => {
    if (!ready) return;

    async function pullIfNewer() {
      if (document.visibilityState !== "visible") return;
      try {
        const remote = await fetchCloudState();
        if (!remote.state || !remote.updatedAt) return;
        if (
          cloudUpdatedAt.current &&
          remote.updatedAt <= cloudUpdatedAt.current
        ) {
          return;
        }
        if (
          businessFingerprint(remote.state) ===
          businessFingerprint(stateRef.current)
        ) {
          cloudUpdatedAt.current = remote.updatedAt;
          return;
        }
        skipNextSave.current = true;
        setState((local) => mergeRemoteKeepingSelection(remote.state!, local));
        saveState(mergeRemoteKeepingSelection(remote.state, stateRef.current));
        cloudUpdatedAt.current = remote.updatedAt;
        setSyncStatus("saved");
        setSyncError(null);
      } catch {
        // ignore poll errors
      }
    }

    const onFocus = () => {
      void pullIfNewer();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    const timer = setInterval(() => {
      void pullIfNewer();
    }, POLL_MS);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      clearInterval(timer);
    };
  }, [ready]);

  const update = useCallback((fn: (prev: UchetState) => UchetState) => {
    setState(fn);
  }, []);

  const filteredOrders = useMemo(() => {
    if (!state.selectedWorkerId) return [];
    return state.orders
      .filter(
        (o) =>
          o.workerId === state.selectedWorkerId &&
          o.monthKey === state.selectedMonthKey
      )
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [state.orders, state.selectedWorkerId, state.selectedMonthKey]);

  const totals = useMemo(
    () => sumOrders(filteredOrders, state.rates),
    [filteredOrders, state.rates]
  );

  const selectedWorker =
    state.workers.find((w) => w.id === state.selectedWorkerId) ?? null;

  const attendanceForMonth = useMemo(() => {
    if (!state.selectedWorkerId) return [];
    const prefix = state.selectedMonthKey;
    return state.attendance.filter(
      (a) => a.workerId === state.selectedWorkerId && a.date.startsWith(prefix)
    );
  }, [state.attendance, state.selectedWorkerId, state.selectedMonthKey]);

  const calendarHours = useMemo(() => {
    const sum = attendanceForMonth.reduce(
      (acc, d) => acc + (Number.isFinite(d.hours) ? d.hours : 0),
      0
    );
    return Math.round((sum + Number.EPSILON) * 100) / 100;
  }, [attendanceForMonth]);

  const monthHours = useMemo(() => {
    if (!state.selectedWorkerId) return 0;
    return resolveMonthHours(
      state.selectedWorkerId,
      state.selectedMonthKey,
      state.attendance,
      state.monthHours ?? {}
    );
  }, [
    state.selectedWorkerId,
    state.selectedMonthKey,
    state.attendance,
    state.monthHours,
  ]);

  const monthRubPerHour = useMemo(
    () => rubPerHour(totals.salary, monthHours),
    [totals.salary, monthHours]
  );

  const workersSalary = useMemo(
    () =>
      allWorkersSalary(
        state.workers,
        state.orders,
        state.attendance,
        state.rates,
        state.selectedMonthKey,
        state.monthHours ?? {}
      ),
    [
      state.workers,
      state.orders,
      state.attendance,
      state.rates,
      state.selectedMonthKey,
      state.monthHours,
    ]
  );

  const value: UchetContextValue = {
    ready,
    syncStatus,
    syncError,
    state,
    filteredOrders,
    totals,
    selectedWorker,
    monthHours,
    calendarHours: Math.round((calendarHours + Number.EPSILON) * 100) / 100,
    monthRubPerHour,
    workersSalary,
    setMonth: (monthKey) => update((s) => ({ ...s, selectedMonthKey: monthKey })),
    setWorker: (workerId) => update((s) => ({ ...s, selectedWorkerId: workerId })),
    addWorker: (name) =>
      update((s) => {
        const worker: Worker = {
          id: createId("w"),
          name: name.trim() || `Рабочий ${s.workers.length + 1}`,
          createdAt: new Date().toISOString(),
        };
        return {
          ...s,
          workers: [...s.workers, worker],
          selectedWorkerId: worker.id,
        };
      }),
    renameWorker: (id, name) =>
      update((s) => ({
        ...s,
        workers: s.workers.map((w) =>
          w.id === id ? { ...w, name: name.trim() || w.name } : w
        ),
      })),
    removeWorker: (id) =>
      update((s) => {
        const workers = s.workers.filter((w) => w.id !== id);
        const monthHoursNext = { ...(s.monthHours ?? {}) };
        for (const key of Object.keys(monthHoursNext)) {
          if (key.startsWith(`${id}:`)) delete monthHoursNext[key];
        }
        return {
          ...s,
          workers,
          orders: s.orders.filter((o) => o.workerId !== id),
          attendance: s.attendance.filter((a) => a.workerId !== id),
          monthHours: monthHoursNext,
          selectedWorkerId:
            s.selectedWorkerId === id
              ? workers[0]?.id ?? null
              : s.selectedWorkerId,
        };
      }),
    addOrder: (input) =>
      update((s) => {
        if (!s.selectedWorkerId) return s;
        const order: Order = {
          id: createId("o"),
          workerId: s.selectedWorkerId,
          monthKey: s.selectedMonthKey,
          orderNumber: input.orderNumber.trim(),
          area: input.area,
          nets: input.nets,
          locks: input.locks,
          note: input.note?.trim() || undefined,
          createdAt: new Date().toISOString(),
        };
        return { ...s, orders: [...s.orders, order] };
      }),
    updateOrder: (id, patch) =>
      update((s) => ({
        ...s,
        orders: s.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
      })),
    removeOrder: (id) =>
      update((s) => ({
        ...s,
        orders: s.orders.filter((o) => o.id !== id),
      })),
    setDayHours: (date, hours) =>
      update((s) => {
        if (!s.selectedWorkerId) return s;
        const rest = s.attendance.filter(
          (a) => !(a.workerId === s.selectedWorkerId && a.date === date)
        );
        if (hours === null || hours <= 0) {
          return { ...s, attendance: rest };
        }
        const clamped = Math.max(0, Math.min(24, Math.round(hours * 100) / 100));
        const next: AttendanceDay = {
          workerId: s.selectedWorkerId,
          date,
          hours: clamped,
        };
        return { ...s, attendance: [...rest, next] };
      }),
    getDayHours: (date) => {
      if (!state.selectedWorkerId) return null;
      const day = state.attendance.find(
        (a) => a.workerId === state.selectedWorkerId && a.date === date
      );
      return day ? day.hours : null;
    },
    setMonthTotalHours: (hours) =>
      update((s) => {
        if (!s.selectedWorkerId) return s;
        const key = monthHoursKey(s.selectedWorkerId, s.selectedMonthKey);
        const next = { ...(s.monthHours ?? {}) };
        if (hours === null || !Number.isFinite(hours) || hours < 0) {
          delete next[key];
        } else {
          next[key] = Math.round(hours * 100) / 100;
        }
        return { ...s, monthHours: next };
      }),
    updateRates: (rates) => update((s) => ({ ...s, rates })),
    replaceState: (next) =>
      setState({ ...next, monthHours: next.monthHours ?? {} }),
    resetAll: () => setState(createInitialState()),
    refreshFromCloud,
  };

  return (
    <UchetContext.Provider value={value}>{children}</UchetContext.Provider>
  );
}

export function useUchet(): UchetContextValue {
  const ctx = useContext(UchetContext);
  if (!ctx) throw new Error("useUchet must be used within UchetProvider");
  return ctx;
}
