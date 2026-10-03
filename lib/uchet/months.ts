const MONTHS_RU = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const MONTHS_SHORT = [
  "янв",
  "фев",
  "мар",
  "апр",
  "май",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "ноя",
  "дек",
];

export function currentMonthKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function parseMonthKey(monthKey: string): { year: number; month: number } {
  const [y, m] = monthKey.split("-").map(Number);
  return { year: y, month: m };
}

export function formatMonthTitle(monthKey: string): string {
  const { year, month } = parseMonthKey(monthKey);
  return `${MONTHS_RU[month - 1]} ${year}`;
}

export function formatMonthShort(monthKey: string): string {
  const { year, month } = parseMonthKey(monthKey);
  return `${MONTHS_SHORT[month - 1]} ${year}`;
}

export function shiftMonth(monthKey: string, delta: number): string {
  const { year, month } = parseMonthKey(monthKey);
  const d = new Date(year, month - 1 + delta, 1);
  return currentMonthKey(d);
}

export function daysInMonth(monthKey: string): number {
  const { year, month } = parseMonthKey(monthKey);
  return new Date(year, month, 0).getDate();
}

export function weekdayIndex(monthKey: string, day: number): number {
  const { year, month } = parseMonthKey(monthKey);
  // Mon=0 … Sun=6
  const js = new Date(year, month - 1, day).getDay();
  return js === 0 ? 6 : js - 1;
}

export function dateKey(monthKey: string, day: number): string {
  return `${monthKey}-${String(day).padStart(2, "0")}`;
}

export function isWeekend(monthKey: string, day: number): boolean {
  const wd = weekdayIndex(monthKey, day);
  return wd >= 5;
}

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
