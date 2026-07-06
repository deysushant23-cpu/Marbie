import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Master Marbie Passkey
const ADMIN_SECRET = process.env.ADMIN_PASSWORD || "marbieadmin123";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login portal and all admin login/auth API endpoints
  if (
    pathname === "/admin/login" ||
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/logout" ||
    pathname === "/admin-login" ||
    pathname === "/api/admin/send-otp"
  ) {
    return NextResponse.next();
  }

  // Check master authentication passkey cookie
  const authCookie = request.cookies.get("admin_token")?.value;
  const isAuthenticated = authCookie === "true";

  // 1. Protect all Admin UI routes (/admin/*)
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Protect backend mutating API routes (POST, PUT, DELETE) against unauthorized injection
  if (pathname.startsWith("/api/")) {
    const isMutatingMethod = ["POST", "PUT", "DELETE", "PATCH"].includes(request.method);

    // Public mutating endpoints allowed for storefront shoppers
    const isPublicMutatingEndpoint =
      (pathname.startsWith("/api/newsletter") && !pathname.startsWith("/api/newsletter/broadcast")) ||
      (pathname.startsWith("/api/orders") && request.method === "POST") ||
      (pathname.startsWith("/api/reviews") && request.method === "POST") ||
      pathname.startsWith("/api/auth/send-otp") ||
      pathname.startsWith("/api/auth/verify-otp") ||
      pathname.startsWith("/api/customers/send-otp") ||
      pathname.startsWith("/api/customers/verify-otp") ||
      pathname.startsWith("/api/auth/") ||
      pathname.startsWith("/api/shipping") ||
      pathname.startsWith("/api/wingman") ||
      pathname.startsWith("/api/vouchers/") ||
      pathname.startsWith("/api/checkout/") ||
      pathname.startsWith("/api/ekart/") ||
      pathname.startsWith("/api/webhooks/") ||
      pathname.startsWith("/api/custom-auth");

    if (isMutatingMethod && !isPublicMutatingEndpoint) {
      const authHeader = request.headers.get("x-admin-secret");
      if (!isAuthenticated && authHeader !== ADMIN_SECRET) {
        return NextResponse.json(
          { error: "🛡️ 403 Forbidden: Marbie Security Shield. Unauthorized backend manipulation blocked." },
          { status: 403 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
