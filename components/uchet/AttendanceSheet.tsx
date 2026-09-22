"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import {
  dateKey,
  daysInMonth,
  formatMonthTitle,
  isWeekend,
  todayKey,
  weekdayIndex,
} from "@/lib/uchet/months";
import { formatArea } from "@/lib/uchet/calc";
import { useUchet } from "@/lib/uchet/store";
import { DEFAULT_SHIFT_HOURS } from "@/lib/uchet/types";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const QUICK = [4, 6, 8, 10, 12];

export function AttendanceSheet() {
  const {
    state,
    selectedWorker,
    getDayHours,
    setDayHours,
    monthHours,
  } = useUchet();
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [hoursDraft, setHoursDraft] = useState("");

  const days = daysInMonth(state.selectedMonthKey);
  const startPad = weekdayIndex(state.selectedMonthKey, 1);
  const today = todayKey();

  useEffect(() => {
    setEditingDay(null);
  }, [state.selectedMonthKey, state.selectedWorkerId]);

  function openDay(day: number) {
    const key = dateKey(state.selectedMonthKey, day);
    const current = getDayHours(key);
    setEditingDay(day);
    setHoursDraft(current != null ? String(current) : String(DEFAULT_SHIFT_HOURS));
  }

  function saveHours(raw?: string) {
    if (editingDay === null) return;
    const key = dateKey(state.selectedMonthKey, editingDay);
    const value = parseFloat((raw ?? hoursDraft).replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      setDayHours(key, null);
    } else {
      setDayHours(key, value);
    }
    setEditingDay(null);
  }

  function clearHours() {
    if (editingDay === null) return;
    const key = dateKey(state.selectedMonthKey, editingDay);
    setDayHours(key, null);
    setEditingDay(null);
  }

  if (!selectedWorker) {
    return (
      <p className="rounded-2xl border border-dashed border-uchet-line p-8 text-center text-sm text-uchet-muted">
        Добавьте рабочего, чтобы вести табель.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-uchet-line bg-white/75 p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-display text-lg font-semibold text-uchet-ink">
              Табель · {selectedWorker.name}
            </p>
            <p className="mt-0.5 text-sm text-uchet-muted">
              {formatMonthTitle(state.selectedMonthKey)} — нажмите день и укажите
              часы
            </p>
          </div>
          <div className="rounded-xl bg-uchet-teal/10 px-3 py-2 text-right">
            <p className="text-[10px] uppercase tracking-wider text-uchet-teal">
              часов за месяц
            </p>
            <p className="font-display text-xl font-semibold tabular-nums text-uchet-teal">
              {formatArea(monthHours)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="pb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-uchet-muted"
            >
              {d}
            </div>
          ))}

          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}

          {Array.from({ length: days }, (_, i) => {
            const day = i + 1;
            const key = dateKey(state.selectedMonthKey, day);
            const hours = getDayHours(key);
            const weekend = isWeekend(state.selectedMonthKey, day);
            const isToday = key === today;
            const active = editingDay === day;
            const worked = hours != null && hours > 0;

            return (
              <motion.button
                key={key}
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => openDay(day)}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-xl border text-sm font-semibold transition ${
                  active
                    ? "border-uchet-teal bg-uchet-teal text-white ring-2 ring-uchet-teal/30"
                    : worked
                      ? "border-uchet-teal/50 bg-uchet-teal/15 text-uchet-ink"
                      : weekend
                        ? "border-uchet-line/80 bg-uchet-paper/60 text-uchet-muted"
                        : "border-uchet-line bg-white text-uchet-ink hover:border-uchet-teal/40"
                } ${isToday && !worked && !active ? "ring-2 ring-uchet-teal/30" : ""}`}
                aria-label={
                  hours
                    ? `День ${day}, ${hours} ч`
                    : `День ${day}, часы не указаны`
                }
              >
                <span className="text-[10px] opacity-70">{day}</span>
                <span className="font-display text-sm leading-none tabular-nums">
                  {worked ? hours : weekend ? "·" : ""}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {editingDay !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="rounded-2xl border border-uchet-teal/30 bg-white p-4 shadow-lg sm:p-5"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="font-display text-base font-semibold text-uchet-ink">
                {editingDay}{" "}
                {formatMonthTitle(state.selectedMonthKey).split(" ")[0].toLowerCase()}{" "}
                — часы
              </p>
              <button
                type="button"
                onClick={() => setEditingDay(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-uchet-muted hover:bg-uchet-paper"
                aria-label="Закрыть"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <input
                value={hoursDraft}
                onChange={(e) => setHoursDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveHours();
                }}
                inputMode="decimal"
                autoFocus
                className="uchet-input flex-1 font-display text-lg font-semibold tabular-nums"
                placeholder="8"
              />
              <button
                type="button"
                onClick={() => saveHours()}
                className="rounded-xl bg-uchet-ink px-4 py-2.5 text-sm font-semibold text-white"
              >
                Сохранить
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => {
                    setHoursDraft(String(h));
                    saveHours(String(h));
                  }}
                  className="rounded-lg border border-uchet-line bg-uchet-paper px-3 py-2 text-sm font-semibold tabular-nums text-uchet-ink hover:border-uchet-teal/40"
                >
                  {h} ч
                </button>
              ))}
              <button
                type="button"
                onClick={clearHours}
                className="rounded-lg border border-uchet-ember/25 px-3 py-2 text-sm font-medium text-uchet-ember hover:bg-uchet-ember/5"
              >
                Очистить
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-uchet-line bg-white/70 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-uchet-muted">
            Дней с часами
          </p>
          <p className="font-display text-2xl font-semibold tabular-nums text-uchet-ink">
            {
              Array.from({ length: days }, (_, i) =>
                getDayHours(dateKey(state.selectedMonthKey, i + 1))
              ).filter((h) => h != null && h > 0).length
            }
          </p>
        </div>
        <div className="rounded-xl border border-uchet-line bg-white/70 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-uchet-muted">
            Всего часов
          </p>
          <p className="font-display text-2xl font-semibold tabular-nums text-uchet-teal">
            {formatArea(monthHours)} ч
          </p>
        </div>
      </div>
    </div>
  );
}
