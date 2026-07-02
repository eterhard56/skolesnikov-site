import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getParserSessionSecret, PARSER_COOKIE_NAME } from "@/lib/parser/config";
import { verifySessionTokenEdge } from "@/lib/parser/session-edge";
import {
  isParserApiRoute,
  isParserRoute,
  isPublicParserApi,
  isPublicParserPage,
  PARSER_DASHBOARD_PATH,
  PARSER_LOGIN_PATH,
} from "@/lib/parser/routes";

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const secret = getParserSessionSecret();
  if (!secret) return false;

  const token = request.cookies.get(PARSER_COOKIE_NAME)?.value;
  if (!token) return false;

  return verifySessionTokenEdge(token, secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const parserPage = isParserRoute(pathname);
  const parserApi = isParserApiRoute(pathname);

  if (!parserPage && !parserApi) {
    return NextResponse.next();
  }

  const authed = await isAuthenticated(request);
  const isPublicPage = parserPage && isPublicParserPage(pathname);
  const isPublicApi =
    parserApi && isPublicParserApi(pathname, request.method);

  if (isPublicPage) {
    if (authed && pathname === PARSER_LOGIN_PATH) {
      return NextResponse.redirect(new URL(PARSER_DASHBOARD_PATH, request.url));
    }
    return NextResponse.next();
  }

  if (isPublicApi) {
    return NextResponse.next();
  }

  if (!authed) {
    if (parserApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL(PARSER_LOGIN_PATH, request.url);
    if (pathname !== PARSER_DASHBOARD_PATH) {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/parser", "/parser/:path*", "/api/parser/:path*"],
};
