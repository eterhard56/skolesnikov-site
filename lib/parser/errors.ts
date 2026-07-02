export const PARSER_ERROR_CODES = {
  TIMEOUT: "TIMEOUT",
  EMPTY_RESULTS: "EMPTY_RESULTS",
  SCRAPE_FAILED: "SCRAPE_FAILED",
} as const;

export type ParserErrorCode =
  (typeof PARSER_ERROR_CODES)[keyof typeof PARSER_ERROR_CODES];

export const PARSER_TIMEOUT_MESSAGE =
  "Слишком долгий ответ от сервиса. Попробуйте позже.";

export const PARSER_SCRAPE_FAILED_MESSAGE =
  "Не удалось получить данные из Yandex Maps. Попробуйте позже.";

export class ParserError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly code?: ParserErrorCode,
    public readonly details?: string
  ) {
    super(message);
    this.name = "ParserError";
  }
}
