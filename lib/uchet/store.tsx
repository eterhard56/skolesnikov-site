"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { sumOrders, type Totals } from "./calc";
import {
  createId,
  createInitialState,
  loadState,
  saveState,
} from "./storage";
import type {
  AttendanceDay,
  AttendanceStatus,
  Order,
  Rates,
  UchetState,
  Worker,
} from "./types";

interface UchetContextValue {
  ready: boolean;
  state: UchetState;
  filteredOrders: Order[];
  totals: Totals;
  selectedWorker: Worker | null;
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
  updateOrder: (id: string, patch: Partial<Omit<Order, "id" | "createdAt">>) => void;
  removeOrder: (id: string) => void;
  setAttendance: (date: string, status: AttendanceStatus | null) => void;
  getAttendance: (date: string) => AttendanceStatus | null;
  attendanceStats: { present: number; half: number; absent: number; off: number };
  updateRates: (rates: Rates) => void;
  replaceState: (next: UchetState) => void;
  resetAll: () => void;
}

const UchetContext = createContext<UchetContextValue | null>(null);

export function UchetProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UchetState>(createInitialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveState(state);
  }, [state, ready]);

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
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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

  const attendanceStats = useMemo(() => {
    const stats = { present: 0, half: 0, absent: 0, off: 0 };
    for (const day of attendanceForMonth) {
      stats[day.status] += 1;
    }
    return stats;
  }, [attendanceForMonth]);

  const value: UchetContextValue = {
    ready,
    state,
    filteredOrders,
    totals,
    selectedWorker,
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
        if (workers.length === 0) {
          const fallback = createInitialState();
          return fallback;
        }
        return {
          ...s,
          workers,
          orders: s.orders.filter((o) => o.workerId !== id),
          attendance: s.attendance.filter((a) => a.workerId !== id),
          selectedWorkerId:
            s.selectedWorkerId === id ? workers[0].id : s.selectedWorkerId,
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
        return { ...s, orders: [order, ...s.orders] };
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
    setAttendance: (date, status) =>
      update((s) => {
        if (!s.selectedWorkerId) return s;
        const rest = s.attendance.filter(
          (a) => !(a.workerId === s.selectedWorkerId && a.date === date)
        );
        if (!status) return { ...s, attendance: rest };
        const next: AttendanceDay = {
          workerId: s.selectedWorkerId,
          date,
          status,
        };
        return { ...s, attendance: [...rest, next] };
      }),
    getAttendance: (date) => {
      if (!state.selectedWorkerId) return null;
      return (
        state.attendance.find(
          (a) => a.workerId === state.selectedWorkerId && a.date === date
        )?.status ?? null
      );
    },
    attendanceStats,
    updateRates: (rates) => update((s) => ({ ...s, rates })),
    replaceState: (next) => setState(next),
    resetAll: () => setState(createInitialState()),
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
