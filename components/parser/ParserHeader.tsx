"use client";

import { Sparkles } from "lucide-react";
import { ParserLogoutButton } from "@/components/parser/ParserLogoutButton";

export function ParserHeader() {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-neutral-200/60 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full glass border-white/60 px-3 py-1.5 text-xs font-medium text-studio-charcoal/75 shadow-glass">
          <Sparkles className="h-3.5 w-3.5 text-studio-accent" />
          AI Lead Parser · MVP
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-studio-charcoal md:text-4xl">
          Парсер компаний
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-500 md:text-base">
          Находите локальный бизнес без сайта — готовые лиды для веб-разработки и
          продвижения.
        </p>
      </div>

      <ParserLogoutButton />
    </header>
  );
}
