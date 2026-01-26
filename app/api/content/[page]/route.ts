import { NextRequest } from 'next/server';
import { getPageContent } from '@/lib/data/content';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { SECURITY_CONFIG } from '@/lib/security/constants';
import type { GetContentResponse } from '@/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  // Apply security (CORS, CSRF, rate limiting)
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.PUBLIC_BROWSING,
  });
  if (securityResponse) return securityResponse;

  try {
    const { page } = await params;
    
    // Validate and sanitize page parameter
    const { isValidPageIdentifier } = await import('@/lib/utils/validation');
    if (!page || !isValidPageIdentifier(page)) {
      return createSecureErrorResponse('Invalid page identifier', 400, request);
    }
    
    const { sanitizeString } = await import('@/lib/security/sanitize');
    const sanitizedPage = sanitizeString(page);
    const content = await getPageContent(sanitizedPage);

    if (!content) {
      return createSecureErrorResponse('Content not found', 404, request);
    }

    const responseData: GetContentResponse = { content };
    const response = createSecureResponse(responseData, 200, request);
    
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response;
  } catch (error) {
    logError('content/[page] API', error);
    return createSecureErrorResponse('Failed to fetch content', 500, request);
  }
}

