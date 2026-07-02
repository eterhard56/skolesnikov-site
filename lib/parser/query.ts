export function buildCombinedSearchQuery(niche: string, city: string): string {
  return `${niche.trim()} ${city.trim()}`.replace(/\s+/g, " ").trim();
}

export function buildYandexMapsSearchUrl(query: string): string {
  return `https://yandex.ru/maps/?text=${encodeURIComponent(query)}`;
}
