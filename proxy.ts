import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getBaseUrl } from '@/lib/utils/env';

export function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/studio') ||
    request.nextUrl.pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  const origin = request.nextUrl.origin;
  const connectSrc = ["'self'", origin];
  try {
    const baseUrl = getBaseUrl();
    if (baseUrl) {
      const baseUrlObj = new URL(baseUrl);
      const baseOrigin = baseUrlObj.origin;
      if (baseOrigin !== origin) {
        connectSrc.push(baseOrigin);
      }
    }
  } catch {
    // NEXT_PUBLIC_BASE_URL not set or invalid; CSP uses origin only
  }

  // unsafe-inline required for Next.js hydration; avoid unsafe-eval in production
  const scriptSrc = "'self' 'unsafe-inline'";
  const frameSrc = "'self'";

  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src ${connectSrc.join(' ')}`,
    `frame-src ${frameSrc}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

