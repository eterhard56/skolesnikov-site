"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CalendarDays,
  Wallet,
  Users,
  Settings2,
  LogOut,
} from "lucide-react";
import type { UchetTab } from "@/lib/uchet/types";
import { formatMonthTitle, shiftMonth } from "@/lib/uchet/months";
import { useUchet } from "@/lib/uchet/store";
import { UCHET_LOGIN_PATH } from "@/lib/uchet/auth-routes";
import { OrderForm } from "./OrderForm";
import { OrdersList } from "./OrdersList";
import { AttendanceSheet } from "./AttendanceSheet";
import { SalaryPanel } from "./SalaryPanel";
import { WorkersPanel } from "./WorkersPanel";
import { RatesPanel } from "./RatesPanel";
import { LiveTotalsBar } from "./LiveTotalsBar";
import { SyncStatusBadge } from "./SyncStatusBadge";
import { WorkerPicker } from "./WorkerPicker";
import { useRouter } from "next/navigation";

const TABS: Array<{ id: UchetTab; label: string; icon: typeof ClipboardList }> = [
  { id: "orders", label: "Заказы", icon: ClipboardList },
  { id: "attendance", label: "Табель", icon: CalendarDays },
  { id: "salary", label: "Зарплата", icon: Wallet },
  { id: "workers", label: "Рабочие", icon: Users },
  { id: "rates", label: "Ставки", icon: Settings2 },
];

export function UchetApp() {
  const { state, selectedWorker, setMonth, setWorker, ready } = useUchet();
  const [tab, setTab] = useState<UchetTab>("orders");
  const router = useRouter();

  async function logout() {
    await fetch("/api/uchet/logout", { method: "POST" });
    router.push(UCHET_LOGIN_PATH);
    router.refresh();
  }

  return (
    <div className="uchet-shell relative min-h-dvh pb-36">
      <div className="uchet-grid-bg pointer-events-none absolute inset-0" aria-hidden />
      <div className="uchet-glow pointer-events-none absolute inset-x-0 top-0 h-72" aria-hidden />

      <header className="relative mx-auto max-w-3xl px-4 pb-2 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6 sm:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex items-start justify-between gap-3"
        >
          <div>
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.28em] text-uchet-teal">
              ПВХ · цех
            </p>
            <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight text-uchet-ink sm:text-5xl">
              ЦехУчёт
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-uchet-muted sm:text-base">
              Заказы, табель с часами и зарплата: ₽/час = сумма работ ÷ часы.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <SyncStatusBadge />
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-uchet-line bg-white/80 px-3 py-2 text-xs font-semibold text-uchet-muted transition hover:border-uchet-ember/30 hover:text-uchet-ember"
              aria-label="Выйти"
            >
              <LogOut className="h-3.5 w-3.5" />
              Выйти
            </button>
          </div>
        </motion.div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <div className="flex flex-1 items-center gap-1 rounded-2xl border border-uchet-line bg-white/80 p-1.5 shadow-sm backdrop-blur">
            <button
              type="button"
              onClick={() => setMonth(shiftMonth(state.selectedMonthKey, -1))}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-uchet-ink transition hover:bg-uchet-paper"
              aria-label="Предыдущий месяц"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1 text-center">
              <p className="text-[10px] uppercase tracking-[0.16em] text-uchet-muted">
                Месяц
              </p>
              <p className="truncate font-display text-base font-semibold text-uchet-ink">
                {formatMonthTitle(state.selectedMonthKey)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMonth(shiftMonth(state.selectedMonthKey, 1))}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-uchet-ink transition hover:bg-uchet-paper"
              aria-label="Следующий месяц"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <label className="flex flex-1 flex-col justify-center rounded-2xl border border-uchet-line bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
            <span className="mb-2 text-[10px] uppercase tracking-[0.16em] text-uchet-muted">
              Рабочий
            </span>
            <WorkerPicker
              workers={state.workers}
              selectedId={state.selectedWorkerId}
              onSelect={setWorker}
              disabled={!ready}
            />
          </label>
        </div>

        <nav
          className="mt-5 flex gap-1 overflow-x-auto rounded-2xl border border-uchet-line bg-white/70 p-1.5 backdrop-blur"
          aria-label="Разделы учёта"
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`relative flex min-w-[4.25rem] flex-1 flex-col items-center gap-1 rounded-xl px-1.5 py-2.5 text-[10px] font-semibold transition sm:min-w-0 sm:flex-row sm:justify-center sm:gap-1.5 sm:px-2 sm:text-sm ${
                  active ? "text-uchet-ink" : "text-uchet-muted hover:text-uchet-ink"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="uchet-tab"
                    className="absolute inset-0 rounded-xl bg-uchet-paper shadow-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className="relative h-4 w-4 shrink-0" />
                <span className="relative whitespace-nowrap">{label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      <main className="relative mx-auto mt-5 max-w-3xl px-4 sm:px-6">
        {!selectedWorker && tab !== "workers" && tab !== "rates" ? (
          <div className="rounded-2xl border border-dashed border-uchet-line bg-white/50 p-8 text-center">
            <p className="font-display text-lg font-semibold text-uchet-ink">
              Добавьте рабочих
            </p>
            <p className="mt-2 text-sm text-uchet-muted">
              Сначала создайте рабочих — у каждого будут свои заказы, табель и
              зарплата.
            </p>
            <button
              type="button"
              onClick={() => setTab("workers")}
              className="mt-4 rounded-xl bg-uchet-ink px-4 py-2.5 text-sm font-semibold text-white"
            >
              К рабочим
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              {tab === "orders" && (
                <>
                  <OrderForm />
                  <OrdersList />
                </>
              )}
              {tab === "attendance" && <AttendanceSheet />}
              {tab === "salary" && <SalaryPanel />}
              {tab === "workers" && <WorkersPanel />}
              {tab === "rates" && <RatesPanel />}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {(tab === "orders" || tab === "salary") && selectedWorker && (
        <LiveTotalsBar />
      )}
    </div>
  );
}
