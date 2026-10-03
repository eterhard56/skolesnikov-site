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
import {
  getUchetSessionSecret,
  UCHET_COOKIE_NAME,
} from "@/lib/uchet/auth-config";
import { verifyUchetSessionTokenEdge } from "@/lib/uchet/session-edge";
import {
  isPublicUchetApi,
  isPublicUchetPage,
  isUchetApiRoute,
  isUchetRoute,
  UCHET_DASHBOARD_PATH,
  UCHET_LOGIN_PATH,
} from "@/lib/uchet/auth-routes";

async function isParserAuthenticated(request: NextRequest): Promise<boolean> {
  const secret = getParserSessionSecret();
  if (!secret) return false;
  const token = request.cookies.get(PARSER_COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionTokenEdge(token, secret);
}

async function isUchetAuthenticated(request: NextRequest): Promise<boolean> {
  const secret = getUchetSessionSecret();
  if (!secret) return false;
  const token = request.cookies.get(UCHET_COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyUchetSessionTokenEdge(token, secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isUchetRoute(pathname) || isUchetApiRoute(pathname)) {
    const authed = await isUchetAuthenticated(request);
    const publicPage = isUchetRoute(pathname) && isPublicUchetPage(pathname);
    const publicApi =
      isUchetApiRoute(pathname) &&
      isPublicUchetApi(pathname, request.method);

    if (publicPage) {
      if (authed && pathname === UCHET_LOGIN_PATH) {
        return NextResponse.redirect(
          new URL(UCHET_DASHBOARD_PATH, request.url)
        );
      }
      return NextResponse.next();
    }

    if (publicApi) {
      return NextResponse.next();
    }

    if (!authed) {
      if (isUchetApiRoute(pathname)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL(UCHET_LOGIN_PATH, request.url);
      if (pathname !== UCHET_DASHBOARD_PATH) {
        loginUrl.searchParams.set("from", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  const parserPage = isParserRoute(pathname);
  const parserApi = isParserApiRoute(pathname);

  if (!parserPage && !parserApi) {
    return NextResponse.next();
  }

  const authed = await isParserAuthenticated(request);
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
  matcher: [
    "/parser",
    "/parser/:path*",
    "/api/parser/:path*",
    "/uchet",
    "/uchet/:path*",
    "/api/uchet/:path*",
  ],
};
