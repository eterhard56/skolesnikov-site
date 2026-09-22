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
  allWorkersSalary,
  rubPerHour,
  sumHours,
  type WorkerSalary,
} from "./salary";
import {
  createId,
  createInitialState,
  loadState,
  saveState,
} from "./storage";
import type {
  AttendanceDay,
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
  /** Hours for selected worker in selected month */
  monthHours: number;
  /** ₽/час for selected worker */
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

  const monthHours = useMemo(
    () => sumHours(attendanceForMonth),
    [attendanceForMonth]
  );

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
        state.selectedMonthKey
      ),
    [
      state.workers,
      state.orders,
      state.attendance,
      state.rates,
      state.selectedMonthKey,
    ]
  );

  const value: UchetContextValue = {
    ready,
    state,
    filteredOrders,
    totals,
    selectedWorker,
    monthHours,
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
        return {
          ...s,
          workers,
          orders: s.orders.filter((o) => o.workerId !== id),
          attendance: s.attendance.filter((a) => a.workerId !== id),
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
