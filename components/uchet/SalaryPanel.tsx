"use client";

import { motion } from "framer-motion";
import { formatArea, formatMoney } from "@/lib/uchet/calc";
import { formatMonthTitle } from "@/lib/uchet/months";
import { useUchet } from "@/lib/uchet/store";

export function SalaryPanel() {
  const {
    state,
    selectedWorker,
    monthHours,
    monthRubPerHour,
    workerPay,
    shop,
    workersSalary,
    shopTotals,
    setWorker,
  } = useUchet();

  const monthTitle = formatMonthTitle(state.selectedMonthKey);
  const selectedRow = workersSalary.find(
    (w) => w.worker.id === selectedWorker?.id
  );

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-uchet-line bg-white/80 p-4 sm:p-5">
        <p className="font-display text-lg font-semibold text-uchet-ink">
          Цех · {monthTitle}
        </p>
        <p className="mt-0.5 text-sm text-uchet-muted">
          ₽/час общий: все работы ÷ все часы всех рабочих
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InfoCard label="Работы цеха" value={formatMoney(shopTotals.salary)} />
          <InfoCard label="Часы всех" value={`${formatArea(shop.totalHours)} ч`} />
          <InfoCard
            label="₽ / час"
            value={shop.totalHours > 0 ? formatMoney(monthRubPerHour) : "—"}
            accent
          />
          <InfoCard label="Заказов" value={String(shopTotals.orderCount)} />
        </div>
      </section>

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
            <Metric
              label="Его заказы"
              value={formatMoney(selectedRow?.orderTotals.salary ?? 0)}
            />
            <Metric label="Часы" value={`${formatArea(monthHours)} ч`} />
            <Metric
              label="₽ / час"
              value={
                shop.totalHours > 0 ? `${formatMoney(monthRubPerHour)}` : "—"
              }
              accent
            />
            <Metric label="К выплате" value={formatMoney(workerPay)} accent />
          </div>

          <div className="border-t border-white/10 bg-black/20 px-5 py-4 sm:px-6">
            {monthHours > 0 && shop.totalHours > 0 ? (
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
                  {formatMoney(workerPay)}
                </span>
              </p>
            ) : (
              <p className="text-sm text-uchet-mist/75">
                Нужны часы у рабочих и заказы за месяц — тогда появится общий
                ₽/час и выплата каждому.
              </p>
            )}
            <p className="mt-2 text-[11px] text-uchet-mist/50">
              ₽/час = работы цеха ÷ сумма часов всех · зарплата = часы × ₽/час
            </p>
          </div>
        </motion.section>
      )}

      <section className="rounded-2xl border border-uchet-line bg-white/80 p-4 sm:p-5">
        <p className="font-display text-lg font-semibold text-uchet-ink">
          Все рабочие · {monthTitle}
        </p>
        <p className="mt-0.5 text-sm text-uchet-muted">
          У каждого свой ₽/час цеха × его часы
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
                        заказов: {row.orderTotals.orderCount} ·{" "}
                        {formatArea(row.orderTotals.area)} м²
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
                        {formatMoney(row.pay)}
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

function InfoCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-uchet-line bg-uchet-paper/60 px-3 py-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-uchet-muted">
        {label}
      </p>
      <p
        className={`mt-0.5 font-display text-lg font-semibold tabular-nums ${
          accent ? "text-uchet-ember" : "text-uchet-ink"
        }`}
      >
        {value}
      </p>
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
