import type { SearchHistoryItem } from "@/lib/parser/types";

const STORAGE_KEY = "parser_search_history";
const MAX_ITEMS = 8;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadSearchHistory(): SearchHistoryItem[] {
  if (!isBrowser()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SearchHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSearchHistory(items: SearchHistoryItem[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
}

export function addSearchHistoryEntry(
  entry: Omit<SearchHistoryItem, "id" | "searchedAt">
): SearchHistoryItem[] {
  const item: SearchHistoryItem = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    searchedAt: new Date().toISOString(),
  };

  const prev = loadSearchHistory().filter(
    (h) => !(h.niche === item.niche && h.city === item.city)
  );

  const next = [item, ...prev].slice(0, MAX_ITEMS);
  saveSearchHistory(next);
  return next;
}

export function clearSearchHistory(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
}
