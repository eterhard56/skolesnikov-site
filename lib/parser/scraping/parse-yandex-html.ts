import * as cheerio from "cheerio";
import { parserLog } from "@/lib/parser/logger";
import {
  extractBusinessesFromHtml,
  type YandexStateBusinessItem,
} from "@/lib/parser/scraping/extract-yandex-state";
import type { YandexRawBusiness } from "@/lib/parser/scraping/types";

type YandexCheerio = ReturnType<typeof cheerio.load>;

const BLOCKED_HOSTS = new Set([
  "ya.ru",
  "yandex.ru",
  "yandex.com",
  "t.me",
  "telegram.me",
  "vk.com",
  "ok.ru",
]);

function normalizeOrgHref(href: string | undefined): string {
  if (!href) return "";
  if (href.startsWith("http")) return href;
  return `https://yandex.ru${href.startsWith("/") ? href : `/${href}`}`;
}

function buildOrgUrlFromId(id: string): string {
  return `https://yandex.ru/maps/?oid=${encodeURIComponent(id)}`;
}

function pickWebsite(urls?: string[]): string {
  if (!Array.isArray(urls)) return "";

  for (const raw of urls) {
    if (!raw || typeof raw !== "string") continue;
    try {
      const url = new URL(raw.trim());
      const host = url.hostname.replace(/^www\./, "").toLowerCase();
      if (BLOCKED_HOSTS.has(host)) continue;
      if (host.endsWith(".yandex.ru") || host.endsWith(".yandex.com")) continue;
      return `${url.protocol}//${url.host}${url.pathname}`.replace(/\/$/, "");
    } catch {
      continue;
    }
  }

  return "";
}

function parseRatingText(text: string): number {
  const match = text.replace(",", ".").match(/(\d+(?:\.\d+)?)/);
  if (!match) return 0;
  const rating = Number(match[1]);
  return Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 0;
}

function parseReviewsCount(text: string): number {
  const match = text.replace(/\s/g, "").match(/\((\d+)\)/);
  if (match) return Number(match[1]) || 0;

  const digits = text.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function indexOrgLinks($: YandexCheerio): Map<string, string> {
  const links = new Map<string, string>();

  $('[data-id][data-object="search-list-item"]').each((_, el) => {
    const id = $(el).attr("data-id");
    const href = $(el).find('a[href*="/org/"]').first().attr("href");
    if (id && href) {
      links.set(id, normalizeOrgHref(href));
    }
  });

  $('a[href*="/maps/org/"]').each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const match = href.match(/\/org\/[^/]+\/(\d+)/);
    if (match?.[1]) {
      links.set(match[1], normalizeOrgHref(href));
    }
  });

  return links;
}

function mapStateItemToRaw(
  item: YandexStateBusinessItem,
  orgLinks: Map<string, string>
): YandexRawBusiness | null {
  const name = (item.title ?? item.name ?? "").trim();
  const id = item.id ? String(item.id) : "";
  if (!name || !id) return null;

  const yandexUrl = orgLinks.get(id) ?? buildOrgUrlFromId(id);

  return {
    id,
    name,
    phone: item.phones?.[0]?.number ?? item.phones?.[0]?.value ?? "",
    website: pickWebsite(item.urls),
    rating: item.ratingData?.ratingValue ?? 0,
    reviewsCount:
      item.ratingData?.ratingCount ?? item.ratingData?.reviewCount ?? 0,
    address: item.address?.trim() ?? "",
    yandexUrl,
    categories:
      item.categories?.map((c) => c.name?.trim()).filter(Boolean) as string[] ??
      [],
  };
}

function parseStateBusinesses(
  html: string,
  orgLinks: Map<string, string>,
  maxItems: number
): YandexRawBusiness[] {
  const stateItems = extractBusinessesFromHtml(html, maxItems);

  return stateItems
    .map((item) => mapStateItemToRaw(item, orgLinks))
    .filter((item): item is YandexRawBusiness => item !== null);
}

function parseSnippetCard(
  $: YandexCheerio,
  el: unknown,
  orgLinks: Map<string, string>
): YandexRawBusiness | null {
  const $card = $(el as never);
  const body = $card.find('[data-object="search-list-item"]').first();
  const id = body.attr("data-id") ?? "";
  const name = $card
    .find(
      ".search-business-snippet-view__title, [class*='snippet-view__title'], .business-card-title-view__title"
    )
    .first()
    .text()
    .trim();

  if (!name) return null;

  const href =
    orgLinks.get(id) ??
    normalizeOrgHref($card.find('a[href*="/org/"]').first().attr("href"));

  const yandexUrl = href || (id ? buildOrgUrlFromId(id) : "");
  if (!yandexUrl.includes("yandex")) return null;

  const ratingText =
    $card.find(".business-rating-badge-view__rating-text").first().text() ||
    $card.find('[class*="rating-text"]').first().text();

  const reviewsText =
    $card.find(".business-rating-with-text-view__count").first().text() ||
    $card
      .find(".a11y-hidden")
      .filter((_, node) => $(node).text().includes("оцен"))
      .first()
      .text();

  const address = $card
    .find(
      ".search-business-snippet-view__address, [class*='snippet-view__address'], .business-card-view__address"
    )
    .first()
    .text()
    .trim();

  const categories = $card
    .find(".search-business-snippet-view__category, [class*='category']")
    .map((_, node) => $(node).text().trim())
    .get()
    .filter(Boolean);

  return {
    id: id || yandexUrl,
    name,
    phone: "",
    website: "",
    rating: parseRatingText(ratingText),
    reviewsCount: parseReviewsCount(reviewsText),
    address,
    yandexUrl,
    categories,
  };
}

function parseHtmlCards(
  $: YandexCheerio,
  orgLinks: Map<string, string>,
  maxItems: number
): YandexRawBusiness[] {
  const selectors = [
    ".search-snippet-view",
    ".serp-item",
    "[data-object='search-list-item']",
    ".search-list-item-view",
  ];

  for (const selector of selectors) {
    const cards = $(selector)
      .map((_, el) => parseSnippetCard($, el, orgLinks))
      .get()
      .filter((item): item is YandexRawBusiness => item !== null);

    if (cards.length > 0) {
      parserLog("DOM cards parsed", { selector, count: cards.length });
      return cards.slice(0, maxItems);
    }
  }

  return [];
}

function mergeBusinesses(
  primary: YandexRawBusiness[],
  fallback: YandexRawBusiness[]
): YandexRawBusiness[] {
  const seen = new Set<string>();
  const merged: YandexRawBusiness[] = [];

  for (const item of [...primary, ...fallback]) {
    const key = item.id || item.yandexUrl;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }

  return merged;
}

export function parseYandexMapsHtml(
  html: string,
  maxItems: number
): YandexRawBusiness[] {
  const $ = cheerio.load(html);
  const orgLinks = indexOrgLinks($);

  const fromState = parseStateBusinesses(html, orgLinks, maxItems);
  const fromCards = parseHtmlCards($, orgLinks, maxItems);
  const cards = mergeBusinesses(fromState, fromCards);

  parserLog("parsed cards count", {
    fromState: fromState.length,
    fromHtml: fromCards.length,
    merged: cards.length,
  });

  return cards.slice(0, maxItems);
}
