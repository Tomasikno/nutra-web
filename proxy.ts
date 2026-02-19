import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProduction = process.env.NODE_ENV === "production";

function createNonce(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

function usesNonceCsp(pathname: string): boolean {
  return /^\/(?:cs|en)\/r\/[^/]+$/.test(pathname) || /^\/r\/[^/]+$/.test(pathname);
}

function buildNonceContentSecurityPolicy(nonce: string): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    isProduction
      ? `script-src 'self' 'nonce-${nonce}'`
      : `script-src 'self' 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval' https://vercel.live`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    isProduction
      ? "connect-src 'self' https://vitals.vercel-insights.com"
      : "connect-src 'self' ws: wss: https://vitals.vercel-insights.com https://vercel.live",
    "frame-src 'self'",
    ...(isProduction ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

function buildStaticContentSecurityPolicy(): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    isProduction
      ? "script-src 'self' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    isProduction
      ? "connect-src 'self' https://vitals.vercel-insights.com"
      : "connect-src 'self' ws: wss: https://vitals.vercel-insights.com https://vercel.live",
    "frame-src 'self'",
    ...(isProduction ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const nonceEnabled = usesNonceCsp(request.nextUrl.pathname);
  const nonce = nonceEnabled ? createNonce() : undefined;

  if (nonce) {
    requestHeaders.set("x-nonce", nonce);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const csp = nonce ? buildNonceContentSecurityPolicy(nonce) : buildStaticContentSecurityPolicy();
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const proxyConfig = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};