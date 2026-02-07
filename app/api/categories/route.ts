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
import { SECURITY_CONFIG } from '@/lib/security/constants';
import type { GetCategoriesResponse } from '@/types/api';

/**
 * GET /api/categories
 * Get all active categories
 */
export async function GET(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.PUBLIC_BROWSING,
  });
  if (securityResponse) return securityResponse;

  try {
    const categoriesData = await getCategories();

    // Map to API response format with id field
    const categories = categoriesData.map(cat => ({
      id: cat.slug, // Use slug as id for API consistency
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      active: cat.active ?? true,
    }));

    const responseData: GetCategoriesResponse = { categories };
    const response = createSecureResponse(responseData, 200, request);
    
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return response;
  } catch (error) {
    logError('categories API', error);
    return createSecureErrorResponse('Failed to fetch categories', 500, request);
  }
}
