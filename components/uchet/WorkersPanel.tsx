"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { useUchet } from "@/lib/uchet/store";

function pluralOrders(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} заказ`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${n} заказа`;
  }
  return `${n} заказов`;
}

export function WorkersPanel() {
  const {
    state,
    selectedWorker,
    setWorker,
    addWorker,
    renameWorker,
    removeWorker,
  } = useUchet();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addWorker(name);
    setName("");
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={onAdd}
        className="rounded-2xl border border-uchet-line bg-white/75 p-4 sm:p-5"
      >
        <p className="font-display text-lg font-semibold text-uchet-ink">
          Рабочие
        </p>
        <p className="mt-0.5 text-sm text-uchet-muted">
          Добавьте своих — у каждого заказы, табель с часами и ₽/час
        </p>
        <div className="mt-4 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Имя рабочего"
            className="uchet-input flex-1"
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (name.trim()) {
                  addWorker(name);
                  setName("");
                }
              }
            }}
          />
          <button
            type="submit"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-uchet-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-uchet-ink/90"
          >
            <Plus className="h-4 w-4" />
            Добавить
          </button>
        </div>
      </form>

      <ul className="space-y-2">
        {state.workers.map((worker) => {
          const active = worker.id === selectedWorker?.id;
          const editing = editingId === worker.id;
          const orderCount = state.orders.filter(
            (o) => o.workerId === worker.id
          ).length;

          return (
            <li
              key={worker.id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-3 transition sm:px-4 ${
                active
                  ? "border-uchet-teal/40 bg-uchet-teal/8"
                  : "border-uchet-line bg-white/70"
              }`}
            >
              {editing ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="uchet-input flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        renameWorker(worker.id, editName);
                        setEditingId(null);
                      }
                      if (e.key === "Escape") {
                        setEditingId(null);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      renameWorker(worker.id, editName);
                      setEditingId(null);
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-uchet-teal hover:bg-uchet-teal/10"
                    aria-label="Сохранить"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-uchet-muted hover:bg-uchet-paper"
                    aria-label="Отмена"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setWorker(worker.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate font-semibold text-uchet-ink">
                      {worker.name}
                    </p>
                    <p className="text-xs text-uchet-muted">
                      {pluralOrders(orderCount)}
                      {active ? " · выбран" : ""}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(worker.id);
                      setEditName(worker.name);
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-uchet-muted hover:bg-uchet-paper hover:text-uchet-ink"
                    aria-label="Переименовать"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(
                          `Удалить «${worker.name}» и все его заказы/табель?`
                        )
                      ) {
                        removeWorker(worker.id);
                      }
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-uchet-muted hover:bg-uchet-ember/10 hover:text-uchet-ember"
                    aria-label="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
