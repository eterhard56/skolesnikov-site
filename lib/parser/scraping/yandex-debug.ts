import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";
import { parserLog } from "@/lib/parser/logger";

const DEBUG_DIR = path.join(process.cwd(), "debug");
const DEBUG_FILE = path.join(DEBUG_DIR, "yandex-response.html");

export type YandexPageType =
  | "captcha"
  | "anti-bot"
  | "redirect"
  | "js-shell"
  | "full"
  | "unknown";

export type YandexPageDetections = {
  initialState: boolean;
  serpItem: boolean;
  searchSnippetView: boolean;
  captcha: boolean;
};

export type YandexPageAnalysis = {
  pageTitle: string;
  htmlSize: number;
  scriptTagsCount: number;
  detections: YandexPageDetections;
  pageType: YandexPageType;
  htmlPreview: string;
};

function detectPageType(
  html: string,
  title: string,
  detections: YandexPageDetections,
  scriptTagsCount: number
): YandexPageType {
  const lowerTitle = title.toLowerCase();
  const lowerHtml = html.toLowerCase();
  const hasStateView = lowerHtml.includes("state-view");
  const hasBusinessMarkup =
    detections.searchSnippetView ||
    detections.serpItem ||
    hasStateView ||
    html.length > 500_000;

  const isCaptchaPage =
    lowerTitle.includes("робот") ||
    lowerTitle.includes("robot") ||
    lowerHtml.includes("checkbox-captcha") ||
    lowerHtml.includes("smartcaptcha") ||
    (html.length < 30_000 &&
      detections.captcha &&
      !hasBusinessMarkup &&
      scriptTagsCount < 15);

  if (isCaptchaPage) {
    return "captcha";
  }

  if (
    lowerHtml.includes("redirect") &&
    (lowerHtml.includes('http-equiv="refresh"') ||
      lowerHtml.includes("http-equiv='refresh'"))
  ) {
    return "redirect";
  }

  if (
    lowerHtml.includes("доступ ограничен") ||
    lowerHtml.includes("access denied") ||
    (lowerHtml.includes("403") && lowerHtml.includes("forbidden"))
  ) {
    return "anti-bot";
  }

  const hasBusinessData =
    detections.searchSnippetView ||
    detections.serpItem ||
    hasStateView ||
    detections.initialState;

  if (html.length > 100_000 && !hasBusinessData) {
    return "js-shell";
  }

  if (hasBusinessData || html.length > 500_000) {
    return "full";
  }

  if (html.length < 50_000 && !hasBusinessData) {
    return "js-shell";
  }

  return "unknown";
}

export function saveYandexDebugHtml(html: string, query: string): void {
  try {
    fs.mkdirSync(DEBUG_DIR, { recursive: true });
    fs.writeFileSync(DEBUG_FILE, html, "utf8");
    parserLog("saved debug HTML", {
      path: DEBUG_FILE,
      query,
      bytes: html.length,
    });
  } catch (err) {
    parserLog("failed to save debug HTML", {
      reason: err instanceof Error ? err.message : "unknown",
    });
  }
}

export function analyzeYandexHtml(html: string): YandexPageAnalysis {
  const $ = cheerio.load(html);
  const pageTitle = $("title").text().trim();
  const lowerHtml = html.toLowerCase();
  const scriptTagsCount = $("script").length;
  const htmlPreview = html.slice(0, 1000);

  const detections: YandexPageDetections = {
    initialState:
      html.includes("INITIAL_STATE") || html.includes("__INITIAL_STATE__"),
    serpItem: lowerHtml.includes("serp-item"),
    searchSnippetView: lowerHtml.includes("search-snippet-view"),
    captcha: lowerHtml.includes("captcha"),
  };

  const pageType = detectPageType(
    html,
    pageTitle,
    detections,
    scriptTagsCount
  );

  parserLog("page title", { pageTitle });
  parserLog("HTML preview", { preview: htmlPreview });
  parserLog("script tags count", { count: scriptTagsCount });
  parserLog("yandex page detections", detections);
  parserLog("yandex page type", { pageType, htmlSize: html.length });

  if (pageType === "captcha") {
    parserLog("yandex response appears to be captcha / anti-bot page");
  } else if (pageType === "js-shell") {
    parserLog("yandex response appears to be JS-rendered shell");
  } else if (pageType === "redirect") {
    parserLog("yandex response appears to be redirect page");
  }

  return {
    pageTitle,
    htmlSize: html.length,
    scriptTagsCount,
    detections,
    pageType,
    htmlPreview,
  };
}

export function getYandexDebugFilePath(): string {
  return DEBUG_FILE;
}
