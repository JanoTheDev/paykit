import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("better-auth.session_token");
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/overview/:path*",
    "/products/:path*",
    "/payments/:path*",
    "/subscribers/:path*",
    "/customers/:path*",
    "/invoices/:path*",
    "/api-keys/:path*",
    "/webhooks/:path*",
    "/settings/:path*",
  ],
};
