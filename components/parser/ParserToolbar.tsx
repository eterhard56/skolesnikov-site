"use client";

import { Download } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ParserToolbarProps = {
  onExport: () => void;
  exportDisabled: boolean;
  isBusy: boolean;
};

export function ParserToolbar({
  onExport,
  exportDisabled,
  isBusy,
}: ParserToolbarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onExport}
        disabled={exportDisabled || isBusy}
        className={secondaryBtnClass}
      >
        <Download className="h-4 w-4" />
        Export CSV
      </button>
    </div>
  );
}

const secondaryBtnClass = cn(
  "inline-flex items-center gap-2 rounded-2xl glass border-white/60 px-4 py-2.5 text-sm font-medium text-studio-charcoal shadow-glass motion-btn",
  "hover:shadow-glass-lg disabled:cursor-not-allowed disabled:opacity-50"
);
