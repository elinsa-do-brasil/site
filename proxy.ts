import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDocsUrl } from "@/lib/docs-url";

const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];
const REDIRECT_LOOKUP_PATH = "/api/payload-redirects";
const DOCS_PATH_ALIASES = new Map([
  ["/codigo-de-conduta", "/etica/codigo-de-conduta"],
]);

type PayloadRedirect = {
  destination?: string;
  statusCode?: number;
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/docs" || pathname.startsWith("/docs/")) {
    return redirectToDocsSite(request);
  }

  const isProtectedPath = pathname.startsWith("/portal");

  if (isProtectedPath) {
    const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) =>
      request.cookies.has(name),
    );

    if (!hasSessionCookie) {
      const loginUrl = new URL("/entrar", request.url);
      loginUrl.searchParams.set(
        "redirectTo",
        `${pathname}${request.nextUrl.search}`,
      );
      return NextResponse.redirect(loginUrl);
    }
  }

  // Payload roda em Node; o proxy só consulta a rota interna para manter este arquivo leve.
  const payloadRedirect = await getPayloadRedirect(request);

  if (payloadRedirect?.destination) {
    const destination = new URL(payloadRedirect.destination, request.url);

    if (destination.href !== request.url) {
      return NextResponse.redirect(
        destination,
        getRedirectStatusCode(payloadRedirect.statusCode),
      );
    }
  }

  return NextResponse.next();
}

function redirectToDocsSite(request: NextRequest) {
  const docsPath = normalizeDocsPath(
    request.nextUrl.pathname.replace(/^\/docs(?=\/|$)/, ""),
  );
  const destination = new URL(
    getDocsUrl(docsPath || "/", request.nextUrl.origin),
  );

  destination.search = request.nextUrl.search;

  return NextResponse.redirect(destination, 308);
}

function normalizeDocsPath(pathname: string) {
  return DOCS_PATH_ALIASES.get(pathname) ?? pathname;
}

async function getPayloadRedirect(request: NextRequest) {
  try {
    const lookupUrl = new URL(REDIRECT_LOOKUP_PATH, request.url);

    lookupUrl.searchParams.set("pathname", request.nextUrl.pathname);

    const response = await fetch(lookupUrl, {
      cache: "no-store",
      headers: {
        "x-payload-redirect-lookup": "1",
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as PayloadRedirect | null;
  } catch {
    return null;
  }
}

function getRedirectStatusCode(statusCode: number | undefined) {
  return statusCode && [301, 302, 303, 307, 308].includes(statusCode)
    ? statusCode
    : 308;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|monitoring|payload|.*\\..*).*)",
  ],
};
