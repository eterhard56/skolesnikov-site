import type { YandexRawBusiness } from "@/lib/parser/scraping/types";
import { parserDebug, parserLog } from "@/lib/parser/logger";
import type { ParserCompany } from "@/lib/parser/types";

function normalizeKeyword(text: string): string {
  return text.toLowerCase().replace(/ё/g, "е").trim();
}

function nicheKeywords(niche: string): string[] {
  return normalizeKeyword(niche)
    .split(/[\s,;/]+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 3);
}

function matchTermsForNiche(niche: string): string[] {
  const keywords = nicheKeywords(niche);
  const terms = new Set<string>(keywords);

  for (const keyword of keywords) {
    terms.add(keyword);
    if (keyword.length >= 6) {
      terms.add(keyword.slice(0, Math.max(6, keyword.length - 2)));
    }
    if (keyword.includes("кондитер")) {
      ["кондитер", "пекар", "торт", "выпеч", "десерт", "кафе", "кофе"].forEach(
        (t) => terms.add(t)
      );
    }
    if (keyword.includes("кафе")) {
      ["кафе", "кофе", "coffee", "ресторан", "бistro"].forEach((t) =>
        terms.add(t)
      );
    }
  }

  return [...terms];
}

function isRelevantToNiche(item: YandexRawBusiness, niche: string): boolean {
  const terms = matchTermsForNiche(niche);
  if (terms.length === 0) return true;

  const haystack = normalizeKeyword(
    [item.name, ...item.categories, item.address].join(" ")
  );

  return terms.some((term) => haystack.includes(term));
}

function isRealBusiness(item: YandexRawBusiness): boolean {
  if (!item.name.trim()) return false;
  if (!item.yandexUrl.includes("yandex")) return false;
  return true;
}

function pickRating(rating: number): number {
  return Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 0;
}

function pickReviewsCount(count: number): number {
  return Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
}

export function normalizeYandexBusiness(
  item: YandexRawBusiness,
  searchNiche: string,
  searchCity: string
): ParserCompany | null {
  if (!isRealBusiness(item)) return null;

  const website = item.website.trim();

  return {
    id: item.id || item.yandexUrl,
    name: item.name.trim(),
    phone: item.phone.trim(),
    website,
    rating: pickRating(item.rating),
    reviewsCount: pickReviewsCount(item.reviewsCount),
    hasWebsite: website.length > 0,
    address: item.address.trim(),
    yandexUrl: item.yandexUrl,
    niche: item.categories[0] ?? searchNiche.trim(),
    city: searchCity.trim(),
  };
}

export function normalizeYandexResults(
  items: YandexRawBusiness[],
  niche: string,
  city: string
): ParserCompany[] {
  const relevant = items.filter(
    (item) => isRealBusiness(item) && isRelevantToNiche(item, niche)
  );

  const companies = relevant
    .map((item) => normalizeYandexBusiness(item, niche, city))
    .filter((company): company is ParserCompany => company !== null);

  parserLog("normalized businesses count", {
    rawCount: items.length,
    relevantCount: relevant.length,
    normalizedCount: companies.length,
    niche,
    city,
  });

  parserDebug(
    "normalized businesses",
    companies.map((c) => ({
      name: c.name,
      phone: c.phone,
      website: c.website,
      rating: c.rating,
      reviewsCount: c.reviewsCount,
      address: c.address,
      yandexUrl: c.yandexUrl,
    }))
  );

  return companies;
}
