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
import { DEFAULT_SHIFT_HOURS, monthHoursKey } from "@/lib/uchet/types";
import { WorkerPicker } from "./WorkerPicker";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const QUICK = [4, 6, 8, 10, 12];
const TOTAL_QUICK = [40, 80, 120, 150, 160, 180];

export function AttendanceSheet() {
  const {
    state,
    selectedWorker,
    setWorker,
    getDayHours,
    setDayHours,
    monthHours,
    calendarHours,
    setMonthTotalHours,
  } = useUchet();
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [hoursDraft, setHoursDraft] = useState("");
  const [totalDraft, setTotalDraft] = useState("");

  const days = daysInMonth(state.selectedMonthKey);
  const startPad = weekdayIndex(state.selectedMonthKey, 1);
  const today = todayKey();
  const overrideKey =
    selectedWorker != null
      ? monthHoursKey(selectedWorker.id, state.selectedMonthKey)
      : null;
  const hasManualTotal =
    overrideKey != null &&
    Object.prototype.hasOwnProperty.call(state.monthHours ?? {}, overrideKey);

  useEffect(() => {
    setEditingDay(null);
  }, [state.selectedMonthKey, state.selectedWorkerId]);

  useEffect(() => {
    setTotalDraft(monthHours > 0 ? String(monthHours).replace(".", ",") : "");
  }, [monthHours, state.selectedWorkerId, state.selectedMonthKey]);

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

  function saveTotalHours(raw?: string) {
    const value = parseFloat((raw ?? totalDraft).replace(",", "."));
    if (!Number.isFinite(value) || value < 0) {
      setMonthTotalHours(null);
      setTotalDraft("");
      return;
    }
    setMonthTotalHours(value);
    setTotalDraft(String(value).replace(".", ","));
  }

  if (state.workers.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-uchet-line p-8 text-center text-sm text-uchet-muted">
        Добавьте рабочих во вкладке «Рабочие», затем укажите часы здесь.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-uchet-line bg-white/75 p-4 sm:p-5">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-uchet-muted">
          Кого отмечаем
        </p>
        <WorkerPicker
          workers={state.workers}
          selectedId={state.selectedWorkerId}
          onSelect={setWorker}
        />
      </div>

      {!selectedWorker ? (
        <p className="rounded-2xl border border-dashed border-uchet-line p-6 text-center text-sm text-uchet-muted">
          Выберите рабочего выше
        </p>
      ) : (
        <>
          <div className="rounded-2xl border border-uchet-teal/30 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="font-display text-lg font-semibold text-uchet-ink">
                  Общие часы · {selectedWorker.name}
                </p>
                <p className="mt-0.5 text-sm text-uchet-muted">
                  {formatMonthTitle(state.selectedMonthKey)} — введите итого за
                  месяц (например 150)
                </p>
              </div>
              {hasManualTotal && (
                <span className="rounded-lg bg-uchet-teal/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-uchet-teal">
                  вручную
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                value={totalDraft}
                onChange={(e) => setTotalDraft(e.target.value)}
                onBlur={() => saveTotalHours()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                inputMode="decimal"
                placeholder="150"
                className="uchet-input flex-1 font-display text-2xl font-semibold tabular-nums"
                aria-label="Общие часы за месяц"
              />
              <button
                type="button"
                onClick={() => saveTotalHours()}
                className="rounded-xl bg-uchet-ink px-4 py-2.5 text-sm font-semibold text-white"
              >
                Сохранить
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {TOTAL_QUICK.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => {
                    setTotalDraft(String(h));
                    saveTotalHours(String(h));
                  }}
                  className="rounded-lg border border-uchet-line bg-uchet-paper px-3 py-2 text-sm font-semibold tabular-nums text-uchet-ink hover:border-uchet-teal/40"
                >
                  {h} ч
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMonthTotalHours(null);
                  setTotalDraft(
                    calendarHours > 0
                      ? String(calendarHours).replace(".", ",")
                      : ""
                  );
                }}
                className="rounded-lg border border-uchet-ember/25 px-3 py-2 text-sm font-medium text-uchet-ember hover:bg-uchet-ember/5"
              >
                Сбросить
              </button>
            </div>

            <p className="mt-3 text-xs text-uchet-muted">
              Итого для зарплаты:{" "}
              <span className="font-semibold tabular-nums text-uchet-teal">
                {formatArea(monthHours)} ч
              </span>
              {calendarHours > 0 && (
                <>
                  {" "}
                  · по дням в календаре: {formatArea(calendarHours)} ч
                </>
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-uchet-line bg-white/75 p-4 sm:p-5">
            <div className="mb-4">
              <p className="font-display text-lg font-semibold text-uchet-ink">
                Календарь по дням
              </p>
              <p className="mt-0.5 text-sm text-uchet-muted">
                Необязательно — если удобнее, достаточно общих часов сверху
              </p>
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
                    {formatMonthTitle(state.selectedMonthKey)
                      .split(" ")[0]
                      .toLowerCase()}{" "}
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
        </>
      )}
    </div>
  );
}
