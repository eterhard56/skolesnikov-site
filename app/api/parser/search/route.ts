import { NextResponse } from "next/server";
import {
  ParserError,
  PARSER_ERROR_CODES,
} from "@/lib/parser/errors";
import { getParserSession } from "@/lib/parser/session";
import { parserService } from "@/lib/parser/services/parser-service";
import { parseSearchRequest } from "@/lib/parser/validation/search-request";
import type { ParserSearchErrorResponse, ParserSearchFailureResponse } from "@/lib/parser/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const authed = await getParserSession();
  if (!authed) {
    return NextResponse.json<ParserSearchErrorResponse>(
      { error: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ParserSearchErrorResponse>(
      { error: "Некорректный JSON", code: "INVALID_BODY" },
      { status: 400 }
    );
  }

  const parsed = parseSearchRequest(body);
  if (!parsed) {
    return NextResponse.json<ParserSearchErrorResponse>(
      { error: "Укажите нишу и город", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  try {
    const result = await parserService.search(parsed);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ParserError) {
      if (err.code === PARSER_ERROR_CODES.EMPTY_RESULTS) {
        return NextResponse.json<ParserSearchFailureResponse>(
          { success: false, error: "Компании не найдены" },
          { status: 404 }
        );
      }

      return NextResponse.json<ParserSearchErrorResponse>(
        {
          error: err.message,
          code: err.code ?? PARSER_ERROR_CODES.SCRAPE_FAILED,
        },
        { status: err.statusCode ?? 502 }
      );
    }

    return NextResponse.json<ParserSearchErrorResponse>(
      { error: "Ошибка поиска. Попробуйте снова.", code: "SEARCH_FAILED" },
      { status: 500 }
    );
  }
}
