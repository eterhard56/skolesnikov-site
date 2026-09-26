"use client";

export function WorkerPicker({
  workers,
  selectedId,
  onSelect,
  disabled,
}: {
  workers: Array<{ id: string; name: string }>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
}) {
  if (workers.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-uchet-line px-3 py-3 text-sm text-uchet-muted">
        Нет рабочих — добавьте во вкладке «Рабочие»
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2" role="listbox" aria-label="Рабочие">
      {workers.map((w) => {
        const active = w.id === selectedId;
        return (
          <button
            key={w.id}
            type="button"
            role="option"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onSelect(w.id)}
            className={`min-h-11 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 ${
              active
                ? "border-uchet-teal bg-uchet-teal text-white shadow-sm"
                : "border-uchet-line bg-white text-uchet-ink hover:border-uchet-teal/40"
            }`}
          >
            {w.name}
          </button>
        );
      })}
    </div>
  );
}
