import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPath = pathname.startsWith("/portal");

  if (isProtectedPath) {
    const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) =>
      request.cookies.has(name),
    );

    if (!hasSessionCookie) {
      const loginUrl = new URL("/entrar", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*"],
};
