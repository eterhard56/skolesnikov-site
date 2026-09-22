"use client";

import { useState } from "react";
import { Download, Upload, RotateCcw } from "lucide-react";
import { DEFAULT_RATES } from "@/lib/uchet/types";
import {
  exportStateJson,
  importStateJson,
} from "@/lib/uchet/storage";
import { useUchet } from "@/lib/uchet/store";
import { formatMoney } from "@/lib/uchet/calc";

export function RatesPanel() {
  const { state, updateRates, replaceState, resetAll } = useUchet();
  const [sqm, setSqm] = useState(String(state.rates.sqm));
  const [lock, setLock] = useState(String(state.rates.lock));
  const [net, setNet] = useState(String(state.rates.net));
  const [message, setMessage] = useState<string | null>(null);

  function saveRates(e: React.FormEvent) {
    e.preventDefault();
    updateRates({
      sqm: Math.max(0, Number(sqm) || 0),
      lock: Math.max(0, Number(lock) || 0),
      net: Math.max(0, Number(net) || 0),
    });
    setMessage("Расценки сохранены");
  }

  function restoreDefaults() {
    setSqm(String(DEFAULT_RATES.sqm));
    setLock(String(DEFAULT_RATES.lock));
    setNet(String(DEFAULT_RATES.net));
    updateRates({ ...DEFAULT_RATES });
    setMessage("Вернули 440 / 300 / 150");
  }

  function onExport() {
    const blob = new Blob([exportStateJson(state)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uchet-pvh-${state.selectedMonthKey}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Файл скачан");
  }

  function onImport(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const next = importStateJson(String(reader.result));
        replaceState(next);
        setSqm(String(next.rates.sqm));
        setLock(String(next.rates.lock));
        setNet(String(next.rates.net));
        setMessage("Данные загружены");
      } catch {
        setMessage("Не удалось прочитать файл");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={saveRates}
        className="rounded-2xl border border-uchet-line bg-white/75 p-4 sm:p-5"
      >
        <p className="font-display text-lg font-semibold text-uchet-ink">
          Расценки
        </p>
        <p className="mt-0.5 text-sm text-uchet-muted">
          Зарплата = м² × ставка + замки × ставка + сетки × ставка
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <RateField
            label="За м²"
            value={sqm}
            onChange={setSqm}
            example={formatMoney(Number(sqm) || 0)}
          />
          <RateField
            label="За замок"
            value={lock}
            onChange={setLock}
            example={formatMoney(Number(lock) || 0)}
          />
          <RateField
            label="За москитную сетку"
            value={net}
            onChange={setNet}
            example={formatMoney(Number(net) || 0)}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-xl bg-uchet-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-uchet-ink/90"
          >
            Сохранить
          </button>
          <button
            type="button"
            onClick={restoreDefaults}
            className="rounded-xl border border-uchet-line bg-white px-4 py-2.5 text-sm font-medium text-uchet-ink hover:bg-uchet-paper"
          >
            По умолчанию
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-uchet-line bg-white/75 p-4 sm:p-5">
        <p className="font-display text-lg font-semibold text-uchet-ink">
          Резервная копия
        </p>
        <p className="mt-0.5 text-sm text-uchet-muted">
          Данные хранятся в этом браузере. Экспортируйте JSON, чтобы не потерять
          учёт.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-2 rounded-xl border border-uchet-line bg-white px-4 py-2.5 text-sm font-medium text-uchet-ink hover:bg-uchet-paper"
          >
            <Download className="h-4 w-4" />
            Скачать
          </button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-uchet-line bg-white px-4 py-2.5 text-sm font-medium text-uchet-ink hover:bg-uchet-paper">
            <Upload className="h-4 w-4" />
            Загрузить
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => onImport(e.target.files?.[0] ?? null)}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              if (confirm("Сбросить все данные учёта?")) {
                resetAll();
                setSqm(String(DEFAULT_RATES.sqm));
                setLock(String(DEFAULT_RATES.lock));
                setNet(String(DEFAULT_RATES.net));
                setMessage("Учёт очищен");
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-uchet-ember/30 px-4 py-2.5 text-sm font-medium text-uchet-ember hover:bg-uchet-ember/5"
          >
            <RotateCcw className="h-4 w-4" />
            Сбросить
          </button>
        </div>
      </div>

      {message && (
        <p className="text-sm text-uchet-teal" role="status">
          {message}
        </p>
      )}
    </div>
  );
}

function RateField({
  label,
  value,
  onChange,
  example,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  example: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-uchet-muted">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="numeric"
        className="uchet-input"
      />
      <span className="mt-1 block text-xs text-uchet-muted">{example}</span>
    </label>
  );
}
