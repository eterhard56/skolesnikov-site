"use client";

import { motion } from "framer-motion";
import { formatArea, formatMoney } from "@/lib/uchet/calc";
import { formatMonthTitle } from "@/lib/uchet/months";
import { useUchet } from "@/lib/uchet/store";

export function SalaryPanel() {
  const {
    state,
    selectedWorker,
    totals,
    monthHours,
    monthRubPerHour,
    workersSalary,
    setWorker,
  } = useUchet();

  const monthTitle = formatMonthTitle(state.selectedMonthKey);

  return (
    <div className="space-y-4">
      {selectedWorker && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-uchet-line bg-uchet-ink text-uchet-paper shadow-lg"
        >
          <div className="px-5 pb-2 pt-5 sm:px-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-uchet-mist/70">
              Зарплата · {monthTitle}
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {selectedWorker.name}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 px-5 py-4 sm:grid-cols-4 sm:px-6">
            <Metric label="Работы" value={formatMoney(totals.salary)} />
            <Metric label="Часы" value={`${formatArea(monthHours)} ч`} />
            <Metric
              label="₽ / час"
              value={
                monthHours > 0 ? `${formatMoney(monthRubPerHour)}` : "—"
              }
              accent
            />
            <Metric label="Заказов" value={String(totals.orderCount)} />
          </div>

          <div className="border-t border-white/10 bg-black/20 px-5 py-4 sm:px-6">
            {monthHours > 0 ? (
              <p className="font-display text-lg leading-snug sm:text-xl">
                <span className="text-white">{selectedWorker.name}</span>
                <span className="text-uchet-mist/70"> · </span>
                <span className="tabular-nums text-white">
                  {formatArea(monthHours)} ч
                </span>
                <span className="text-uchet-mist/70"> × </span>
                <span className="tabular-nums text-uchet-ember">
                  {formatMoney(monthRubPerHour)}
                </span>
                <span className="text-uchet-mist/70"> = </span>
                <span className="tabular-nums font-semibold text-uchet-ember">
                  {formatMoney(totals.salary)}
                </span>
              </p>
            ) : (
              <p className="text-sm text-uchet-mist/75">
                Укажите часы в табеле — появится рубль/час: сумма работ ÷ часы.
              </p>
            )}
            <p className="mt-2 text-[11px] text-uchet-mist/50">
              ₽/час = итого по заказам ÷ отработанные часы
            </p>
          </div>
        </motion.section>
      )}

      <section className="rounded-2xl border border-uchet-line bg-white/80 p-4 sm:p-5">
        <p className="font-display text-lg font-semibold text-uchet-ink">
          Все рабочие · {monthTitle}
        </p>
        <p className="mt-0.5 text-sm text-uchet-muted">
          Сводка по цеху за месяц
        </p>

        {workersSalary.length === 0 ? (
          <p className="mt-6 text-center text-sm text-uchet-muted">
            Добавьте рабочих во вкладке «Рабочие».
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-uchet-line/80">
            {workersSalary.map((row) => {
              const active = row.worker.id === selectedWorker?.id;
              return (
                <li key={row.worker.id}>
                  <button
                    type="button"
                    onClick={() => setWorker(row.worker.id)}
                    className={`flex w-full flex-col gap-1 px-1 py-3.5 text-left transition sm:flex-row sm:items-center sm:justify-between ${
                      active ? "opacity-100" : "opacity-90 hover:opacity-100"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-uchet-ink">
                        {row.worker.name}
                        {active ? (
                          <span className="ml-2 text-[10px] font-medium uppercase tracking-wider text-uchet-teal">
                            выбран
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-uchet-muted">
                        {row.totals.orderCount} зак. · {formatArea(row.totals.area)} м²
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      {row.hours > 0 ? (
                        <p className="font-display text-sm font-semibold tabular-nums text-uchet-ink">
                          {formatArea(row.hours)} ч × {formatMoney(row.rubPerHour)}
                        </p>
                      ) : (
                        <p className="text-xs text-uchet-muted">часы не указаны</p>
                      )}
                      <p className="font-display text-base font-semibold tabular-nums text-uchet-ember">
                        {formatMoney(row.totals.salary)}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-uchet-mist/55">
        {label}
      </p>
      <p
        className={`mt-0.5 font-display text-lg font-semibold tabular-nums sm:text-xl ${
          accent ? "text-uchet-ember" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
