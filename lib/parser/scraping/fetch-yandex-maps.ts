import axios, { isAxiosError } from "axios";
import { YANDEX_FETCH_TIMEOUT_MS } from "@/lib/parser/config";
import {
  PARSER_ERROR_CODES,
  PARSER_SCRAPE_FAILED_MESSAGE,
  PARSER_TIMEOUT_MESSAGE,
  ParserError,
} from "@/lib/parser/errors";
import { parserLog } from "@/lib/parser/logger";
import { buildYandexMapsSearchUrl } from "@/lib/parser/query";
import { pickRandomUserAgent } from "@/lib/parser/scraping/user-agent";
import {
  analyzeYandexHtml,
  saveYandexDebugHtml,
} from "@/lib/parser/scraping/yandex-debug";

function buildRequestHeaders(userAgent: string): Record<string, string> {
  return {
    "User-Agent": userAgent,
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Referer: "https://yandex.ru/maps/",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Upgrade-Insecure-Requests": "1",
  };
}

function assertHtmlIsUsable(
  html: string,
  analysis: ReturnType<typeof analyzeYandexHtml>
): void {
  if (analysis.pageType === "captcha") {
    throw new ParserError(
      "Yandex Maps запросил проверку (captcha). Попробуйте позже.",
      503,
      PARSER_ERROR_CODES.SCRAPE_FAILED,
      "captcha"
    );
  }

  if (analysis.pageType === "anti-bot") {
    throw new ParserError(
      "Доступ к Yandex Maps временно ограничен. Попробуйте позже.",
      503,
      PARSER_ERROR_CODES.SCRAPE_FAILED,
      "anti-bot"
    );
  }

  if (analysis.pageType === "redirect") {
    throw new ParserError(
      PARSER_SCRAPE_FAILED_MESSAGE,
      502,
      PARSER_ERROR_CODES.SCRAPE_FAILED,
      "redirect"
    );
  }

  if (
    html.length < 20_000 &&
    !analysis.detections.searchSnippetView &&
    !analysis.detections.initialState &&
    !html.includes("state-view")
  ) {
    parserLog("yandex HTML likely blocked or empty shell", {
      htmlSize: html.length,
      pageType: analysis.pageType,
    });
  }
}

export async function fetchYandexMapsHtml(query: string): Promise<string> {
  const url = buildYandexMapsSearchUrl(query);
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const userAgent = pickRandomUserAgent();

    parserLog("yandex fetch attempt", {
      attempt,
      query,
      userAgent: userAgent.slice(0, 40),
    });

    try {
      const response = await axios.get<string>(url, {
        timeout: YANDEX_FETCH_TIMEOUT_MS,
        responseType: "text",
        headers: buildRequestHeaders(userAgent),
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 400,
      });

      const html = response.data;

      parserLog("fetched HTML size", {
        query,
        bytes: html.length,
        attempt,
      });

      saveYandexDebugHtml(html, query);
      const analysis = analyzeYandexHtml(html);
      assertHtmlIsUsable(html, analysis);

      return html;
    } catch (err) {
      if (err instanceof ParserError) throw err;

      lastError = err;

      if (isAxiosError(err) && err.code === "ECONNABORTED") {
        parserLog("yandex fetch timeout", { attempt, query });
        if (attempt === 2) {
          throw new ParserError(
            PARSER_TIMEOUT_MESSAGE,
            504,
            PARSER_ERROR_CODES.TIMEOUT
          );
        }
        continue;
      }

      parserLog("yandex fetch error", {
        attempt,
        query,
        reason: err instanceof Error ? err.message : "unknown",
      });

      if (attempt === 2) break;
    }
  }

  throw new ParserError(
    PARSER_SCRAPE_FAILED_MESSAGE,
    502,
    PARSER_ERROR_CODES.SCRAPE_FAILED,
    lastError instanceof Error ? lastError.message : undefined
  );
}
