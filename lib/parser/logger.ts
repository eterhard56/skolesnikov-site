/** Structured backend logging for parser search flow */
export function parserLog(
  stage: string,
  data?: Record<string, unknown> | unknown[]
): void {
  const prefix = "[parser]";
  if (data === undefined) {
    console.log(`${prefix} ${stage}`);
    return;
  }
  console.log(`${prefix} ${stage}`, data);
}

export function parserDebug(
  stage: string,
  data?: Record<string, unknown> | unknown
): void {
  if (process.env.PARSER_DEBUG === "0") return;
  parserLog(`[debug] ${stage}`, data as Record<string, unknown> | undefined);
}
