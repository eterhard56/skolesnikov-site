"use client";

import { motion } from "framer-motion";
import {
  dateKey,
  daysInMonth,
  formatMonthTitle,
  isWeekend,
  todayKey,
  weekdayIndex,
} from "@/lib/uchet/months";
import type { AttendanceStatus } from "@/lib/uchet/types";
import { useUchet } from "@/lib/uchet/store";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const CYCLE: Array<AttendanceStatus | null> = [
  null,
  "present",
  "half",
  "absent",
  "off",
];

const STATUS_STYLE: Record<
  AttendanceStatus,
  { label: string; className: string }
> = {
  present: {
    label: "Я",
    className: "bg-uchet-teal text-white border-uchet-teal",
  },
  half: {
    label: "½",
    className: "bg-uchet-amber/90 text-uchet-ink border-uchet-amber",
  },
  absent: {
    label: "Н",
    className: "bg-uchet-ember/90 text-white border-uchet-ember",
  },
  off: {
    label: "В",
    className: "bg-uchet-ink/80 text-white border-uchet-ink",
  },
};

export function AttendanceSheet() {
  const {
    state,
    selectedWorker,
    getAttendance,
    setAttendance,
    attendanceStats,
  } = useUchet();

  const days = daysInMonth(state.selectedMonthKey);
  const startPad = weekdayIndex(state.selectedMonthKey, 1);
  const today = todayKey();

  function cycleDay(day: number) {
    const key = dateKey(state.selectedMonthKey, day);
    const current = getAttendance(key);
    const idx = CYCLE.indexOf(current);
    const next = CYCLE[(idx + 1) % CYCLE.length];
    setAttendance(key, next);
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
              {formatMonthTitle(state.selectedMonthKey)} — нажимайте день, чтобы
              отметить
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <Legend swatch="bg-uchet-teal" label="Явка" />
            <Legend swatch="bg-uchet-amber" label="Полдня" />
            <Legend swatch="bg-uchet-ember" label="Неявка" />
            <Legend swatch="bg-uchet-ink/80" label="Выходной" />
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
            const status = getAttendance(key);
            const weekend = isWeekend(state.selectedMonthKey, day);
            const isToday = key === today;
            const style = status ? STATUS_STYLE[status] : null;

            return (
              <motion.button
                key={key}
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => cycleDay(day)}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-xl border text-sm font-semibold transition ${
                  style
                    ? style.className
                    : weekend
                      ? "border-uchet-line/80 bg-uchet-paper/60 text-uchet-muted"
                      : "border-uchet-line bg-white text-uchet-ink hover:border-uchet-teal/40"
                } ${isToday && !status ? "ring-2 ring-uchet-teal/40" : ""}`}
                aria-label={`День ${day}${status ? `, ${STATUS_STYLE[status].label}` : ""}`}
              >
                <span className="text-[11px] opacity-70">{day}</span>
                <span className="font-display text-sm leading-none">
                  {style?.label ?? (weekend ? "·" : "")}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Явок" value={attendanceStats.present} tone="teal" />
        <StatCard label="Полдня" value={attendanceStats.half} tone="amber" />
        <StatCard label="Неявок" value={attendanceStats.absent} tone="ember" />
        <StatCard label="Выходных" value={attendanceStats.off} tone="ink" />
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-uchet-muted">
      <span className={`h-2.5 w-2.5 rounded-sm ${swatch}`} />
      {label}
    </span>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "teal" | "amber" | "ember" | "ink";
}) {
  const tones = {
    teal: "text-uchet-teal",
    amber: "text-uchet-amber-ink",
    ember: "text-uchet-ember",
    ink: "text-uchet-ink",
  };
  return (
    <div className="rounded-xl border border-uchet-line bg-white/70 px-3 py-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-uchet-muted">
        {label}
      </p>
      <p className={`font-display text-2xl font-semibold tabular-nums ${tones[tone]}`}>
        {value}
      </p>
    </div>
  );
}
