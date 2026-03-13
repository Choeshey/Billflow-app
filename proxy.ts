import { NextResponse, type NextRequest } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { verifyClientToken, CLIENT_COOKIE_NAME } from "@/lib/client-auth";

// ── Public paths — no auth required ───────────────────────────────────────
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/client/login",
  "/api/client-auth/login",
];

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Allow public paths through
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // ── Client portal routes ─────────────────────────────────────────────────
  if (pathname.startsWith("/client/portal") || pathname.startsWith("/api/client-portal") || pathname.startsWith("/api/client-auth")) {
    const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/client/login", request.url));
    }
    try {
      await verifyClientToken(token);
      return NextResponse.next();
    } catch {
      const res = NextResponse.redirect(new URL("/client/login", request.url));
      res.cookies.delete(CLIENT_COOKIE_NAME);
      return res;
    }
  }

  // ── Admin dashboard routes ───────────────────────────────────────────────
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await verifyToken(token);
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.delete(COOKIE_NAME);
    return res;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/client/:path*",
    "/api/clients/:path*",
    "/api/invoices/:path*",
    "/api/dashboard/:path*",
    "/api/subscription/:path*",
    "/api/user/:path*",
    "/api/client-portal/:path*",
    "/api/client-auth/:path*",
  ],
};