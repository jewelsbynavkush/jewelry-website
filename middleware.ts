import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getBaseUrl } from '@/lib/utils/env';

export default function middleware(request: NextRequest) {
  // Skip security headers for internal Next.js routes and API endpoints
  // API routes handle their own security headers
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/studio') ||
    request.nextUrl.pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Apply security headers to all page responses
  // These headers prevent common web vulnerabilities (XSS, clickjacking, MIME sniffing)
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy
  // 'unsafe-eval' and 'unsafe-inline' are required for Next.js runtime
  // Future enhancement: use nonces or hashes for stricter CSP
  // Include request origin and base URL in connect-src to allow API calls in Vercel deployments
  const origin = request.nextUrl.origin;
  const baseUrl = getBaseUrl();
  
  // Build connect-src directive with allowed origins
  const connectSrc = ["'self'", origin];
  if (baseUrl) {
    try {
      const baseUrlObj = new URL(baseUrl);
      const baseOrigin = baseUrlObj.origin;
      // Only add if different from request origin to avoid duplicates
      if (baseOrigin !== origin) {
        connectSrc.push(baseOrigin);
      }
    } catch {
      // Invalid URL format, skip
    }
  }
  
  const scriptSrc = "'self' 'unsafe-eval' 'unsafe-inline'";
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
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

