import { NextRequest } from 'next/server';
import { getProduct } from '@/lib/data/products';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { sanitizeString } from '@/lib/security/sanitize';
import { isValidSlug } from '@/lib/utils/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Apply security (CORS, CSRF, rate limiting)
  // Industry standard: 200 requests per 15 minutes for public browsing endpoints
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 200 }, // 200 requests per 15 minutes (industry standard)
  });
  if (securityResponse) return securityResponse;

  try {
    const { slug } = await params;
    
    // Validate and sanitize slug parameter
    if (!slug || !isValidSlug(slug)) {
      return createSecureErrorResponse('Invalid product identifier', 400, request);
    }
    
    const sanitizedSlug = sanitizeString(slug);
    const product = await getProduct(sanitizedSlug);

    if (!product) {
      return createSecureErrorResponse('Product not found', 404, request);
    }

    const response = createSecureResponse(
      { product },
      200,
      request
    );
    
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response;
  } catch (error) {
    logError('products/[slug] API', error);
    return createSecureErrorResponse('Failed to fetch product', 500, request);
  }
}

