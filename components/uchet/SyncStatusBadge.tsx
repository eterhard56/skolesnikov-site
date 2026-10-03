"use client";

import { Cloud, CloudOff, Loader2, RefreshCw } from "lucide-react";
import { useUchet } from "@/lib/uchet/store";

export function SyncStatusBadge() {
  const { syncStatus, syncError, refreshFromCloud, ready } = useUchet();

  if (!ready && syncStatus === "loading") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] text-uchet-muted">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Загрузка…
      </span>
    );
  }

  const map = {
    loading: {
      icon: Loader2,
      text: "Загрузка…",
      className: "text-uchet-muted",
      spin: true,
    },
    saving: {
      icon: Loader2,
      text: "Сохранение…",
      className: "text-uchet-muted",
      spin: true,
    },
    saved: {
      icon: Cloud,
      text: "На сервере",
      className: "text-uchet-teal",
      spin: false,
    },
    error: {
      icon: CloudOff,
      text: syncError ?? "Ошибка синхронизации",
      className: "text-uchet-ember",
      spin: false,
    },
    offline: {
      icon: CloudOff,
      text: syncError ?? "Офлайн",
      className: "text-uchet-ember",
      spin: false,
    },
    idle: {
      icon: Cloud,
      text: "Готово",
      className: "text-uchet-muted",
      spin: false,
    },
  } as const;

  const cfg = map[syncStatus];
  const Icon = cfg.icon;

  return (
    <span className={`inline-flex max-w-[11rem] items-center gap-1.5 text-[11px] ${cfg.className}`}>
      <Icon className={`h-3.5 w-3.5 shrink-0 ${cfg.spin ? "animate-spin" : ""}`} />
      <span className="truncate">{cfg.text}</span>
      {(syncStatus === "error" || syncStatus === "offline") && (
        <button
          type="button"
          onClick={() => void refreshFromCloud()}
          className="shrink-0 rounded-md p-0.5 hover:bg-uchet-paper"
          aria-label="Обновить с сервера"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      )}
    </span>
  );
}
