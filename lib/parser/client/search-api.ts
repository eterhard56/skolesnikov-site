import type {
  ParserSearchErrorResponse,
  ParserSearchFailureResponse,
  ParserSearchRequest,
  ParserSearchResponse,
} from "@/lib/parser/types";

export class ParserSearchApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ParserSearchApiError";
  }
}

const CLIENT_TIMEOUT_MS = 12_000;

function isFailureResponse(
  data: unknown
): data is ParserSearchFailureResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "success" in data &&
    (data as ParserSearchFailureResponse).success === false &&
    typeof (data as ParserSearchFailureResponse).error === "string"
  );
}

export async function fetchParserSearch(
  request: ParserSearchRequest
): Promise<ParserSearchResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

  try {
    const res = await fetch("/api/parser/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as
        | ParserSearchErrorResponse
        | ParserSearchFailureResponse
        | null;

      if (isFailureResponse(data)) {
        throw new ParserSearchApiError(
          data.error,
          res.status,
          "EMPTY_RESULTS"
        );
      }

      throw new ParserSearchApiError(
        data?.error ?? "Не удалось выполнить поиск",
        res.status,
        data?.code
      );
    }

    return res.json() as Promise<ParserSearchResponse>;
  } catch (err) {
    if (err instanceof ParserSearchApiError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ParserSearchApiError(
        "Слишком долгий ответ от сервиса. Попробуйте позже.",
        504,
        "TIMEOUT"
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
