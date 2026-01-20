/**
 * Categories API Route
 * 
 * Handles category operations:
 * - GET: Get all active categories
 * 
 * Optional API endpoint for consistency
 */

import { NextRequest } from 'next/server';
import { getCategories } from '@/lib/data/categories';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';

/**
 * GET /api/categories
 * Get all active categories
 */
export async function GET(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  // Industry standard: 200 requests per 15 minutes for public browsing endpoints
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 200 }, // 200 requests per 15 minutes (industry standard)
  });
  if (securityResponse) return securityResponse;

  try {
    const categories = await getCategories();

    const response = createSecureResponse(
      { categories },
      200,
      request
    );
    
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response;
  } catch (error) {
    logError('categories API', error);
    return createSecureErrorResponse('Failed to fetch categories', 500, request);
  }
}
