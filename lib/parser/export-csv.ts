import type { ParserCompany } from "@/lib/parser/types";

function escapeCsvValue(value: string | number | boolean): string {
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function companiesToCsv(companies: ParserCompany[]): string {
  const headers = [
    "Компания",
    "Телефон",
    "Рейтинг",
    "Отзывы",
    "Сайт",
    "Ссылка на карты",
    "Ниша",
    "Город",
  ];

  const rows = companies.map((c) => [
    c.name,
    c.phone,
    c.rating.toFixed(1),
    c.reviewsCount,
    c.website || (c.hasWebsite ? "Есть" : "Нет"),
    c.yandexUrl,
    c.niche,
    c.city,
  ]);

  const lines = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ];

  return lines.join("\n");
}

export function downloadCsv(companies: ParserCompany[], filename: string) {
  const csv = companiesToCsv(companies);
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
