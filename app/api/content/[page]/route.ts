import { NextRequest } from 'next/server';
import { getPageContent } from '@/lib/data/content';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { sanitizeString } from '@/lib/security/sanitize';
import { isValidPageIdentifier } from '@/lib/utils/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  // Apply security (CORS, CSRF, rate limiting)
  // Industry standard: 200 requests per 15 minutes for public browsing endpoints
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 200 }, // 200 requests per 15 minutes (industry standard)
  });
  if (securityResponse) return securityResponse;

  try {
    const { page } = await params;
    
    // Validate and sanitize page parameter
    if (!page || !isValidPageIdentifier(page)) {
      return createSecureErrorResponse('Invalid page identifier', 400, request);
    }
    
    const sanitizedPage = sanitizeString(page);
    const content = await getPageContent(sanitizedPage);

    if (!content) {
      return createSecureErrorResponse('Content not found', 404, request);
    }

    const response = createSecureResponse(
      { content },
      200,
      request
    );
    
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response;
  } catch (error) {
    logError('content/[page] API', error);
    return createSecureErrorResponse('Failed to fetch content', 500, request);
  }
}

