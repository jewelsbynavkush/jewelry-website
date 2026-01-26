/**
 * User Logout API Route
 * 
 * Handles user logout:
 * - POST: Logout user, clear session, and revoke refresh tokens
 * - Industry standard: Revoke all refresh tokens on logout
 */

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { applyApiSecurity, createSecureResponse, checkUserRateLimit } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { clearSession } from '@/lib/auth/session';
import { SECURITY_CONFIG } from '@/lib/security/constants';
import type { LogoutResponse } from '@/types/api';

/**
 * POST /api/auth/logout
 * Logout user
 */
export async function POST(request: NextRequest) {
  // Apply security (CORS, CSRF, basic rate limiting)
  // Initial rate limit is IP-based for unauthenticated requests
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.AUTH_LOGOUT,
  });
  if (securityResponse) return securityResponse;

  try {
    // Verify authentication (optional - allow logout even if token is invalid)
    // Industry standard: Get userId to revoke refresh tokens
    const authResult = await requireAuth(request).catch(() => null);
    const userId = authResult && 'user' in authResult ? authResult.user.userId : null;

    // Apply user-based rate limiting for authenticated users
    // Provides better rate limiting per user while maintaining IP-based limit for guests
    if (userId) {
      const userRateLimitResponse = checkUserRateLimit(
        request,
        userId,
        SECURITY_CONFIG.RATE_LIMIT.AUTH_LOGOUT
      );
      if (userRateLimitResponse) return userRateLimitResponse;
    }

    const responseData: LogoutResponse = {
      success: true,
      message: 'Logged out successfully',
    };
    const response = createSecureResponse(responseData, 200, request);

    // Clear session cookies and revoke refresh tokens
    // Industry standard: Revoke all refresh tokens on logout
    await clearSession(response, userId || undefined);

    return response;
  } catch (error) {
    logError('logout API', error);
    
    // Even if there's an error, clear the session
    const responseData: LogoutResponse = {
      success: true,
      message: 'Logged out successfully',
    };
    const response = createSecureResponse(responseData, 200, request);

    await clearSession(response);
    return response;
  }
}
