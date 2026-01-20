/**
 * User Logout API Route
 * 
 * Handles user logout:
 * - POST: Logout user, clear session, and revoke refresh tokens
 * - Industry standard: Revoke all refresh tokens on logout
 */

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { applyApiSecurity, createSecureResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { clearSession } from '@/lib/auth/session';

/**
 * POST /api/auth/logout
 * Logout user
 */
export async function POST(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  // Industry standard: 20 logout requests per 15 minutes (same for all environments)
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 20 }, // 20 requests per 15 minutes (industry standard)
  });
  if (securityResponse) return securityResponse;

  try {
    // Verify authentication (optional - allow logout even if token is invalid)
    // Industry standard: Get userId to revoke refresh tokens
    const authResult = await requireAuth(request).catch(() => null);
    const userId = authResult && 'user' in authResult ? authResult.user.userId : null;

    const response = createSecureResponse(
      {
        success: true,
        message: 'Logged out successfully',
      },
      200,
      request
    );

    // Clear session cookies and revoke refresh tokens
    // Industry standard: Revoke all refresh tokens on logout
    await clearSession(response, userId || undefined);

    return response;
  } catch (error) {
    logError('logout API', error);
    
    // Even if there's an error, clear the session
    const response = createSecureResponse(
      {
        success: true,
        message: 'Logged out successfully',
      },
      200,
      request
    );

    await clearSession(response);
    return response;
  }
}
