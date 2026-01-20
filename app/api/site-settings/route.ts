import { NextRequest } from 'next/server';
import { getSiteSettings } from '@/lib/data/site-settings';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';

export async function GET(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  // Industry standard: 200 requests per 15 minutes for public content endpoints
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 200 }, // 200 requests per 15 minutes (industry standard)
  });
  if (securityResponse) return securityResponse;

  try {
    const settings = await getSiteSettings();
    const response = createSecureResponse(
      { settings },
      200,
      request
    );
    
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response;
  } catch (error) {
    logError('site-settings API', error);
    return createSecureErrorResponse('Failed to fetch site settings', 500, request);
  }
}

