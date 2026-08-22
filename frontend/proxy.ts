/**
 * GlobeTrotter — Route Protection Middleware
 *
 * Runs on the Edge before every request to guarded routes.
 * If the `token` HttpOnly cookie is absent → redirect to /login.
 * If an authenticated user hits /login or /register → redirect to /dashboard.
 *
 * NOTE: This only checks cookie presence. Real token validation happens
 * on the backend via GET /api/auth/me; AuthContext handles that.
 */

import { NextRequest, NextResponse } from "next/server";

/** Routes that require an authenticated session */
const PROTECTED_PATHS = [
  "/dashboard",
  "/trips",
  "/calendar",
  "/profile",
  "/discover",
];

/** Routes that authenticated users should not access */
const AUTH_ONLY_PATHS = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // 1. Authenticated users visiting login/register → send to dashboard
  if (AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p)) && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 2. Unauthenticated users visiting protected routes → send to login
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Match all paths except Next.js internals and static assets
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)",
  ],
};
