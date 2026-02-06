/**
 * Token Refresh API Route
 * 
 * Industry standard OAuth 2.0 refresh token implementation:
 * - Token rotation: New refresh token on each use, old one revoked
 * - Reuse detection: If old token is reused, revoke entire token family
 * - Idle expiration: Token expires if not used for 7 days
 * - Absolute expiration: Token expires after 30 days
 * - Validates user account status and role
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import RefreshToken from '@/models/RefreshToken';
import { getRefreshTokenFromCookie } from '@/lib/auth/session';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { isProduction } from '@/lib/utils/env';
import { generateAccessToken } from '@/lib/auth/jwt';
import { SECURITY_CONFIG, TIME_DURATIONS } from '@/lib/security/constants';
import type { RefreshTokenResponse } from '@/types/api';

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 * 
 * Industry standard flow:
 * 1. Validate refresh token (not expired, not idle, not revoked)
 * 2. Check if token was already used (reuse detection)
 * 3. Revoke old refresh token
 * 4. Generate new access token and new refresh token (rotation)
 * 5. Return new tokens
 */
export async function POST(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.REFRESH,
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    // HTTP-only cookies prevent XSS attacks by making token inaccessible to JavaScript
    const refreshTokenValue = getRefreshTokenFromCookie(request.cookies);

    if (!refreshTokenValue) {
      return createSecureErrorResponse('No refresh token provided', 401, request);
    }

    // Industry standard: Check revoked tokens separately to detect reuse attacks
    const crypto = await import('crypto');
    const hashedToken = crypto.createHash('sha256').update(refreshTokenValue).digest('hex');
    const refreshTokenDoc = await RefreshToken.findOne({ token: hashedToken });

    if (!refreshTokenDoc) {
      return createSecureErrorResponse('Invalid refresh token', 401, request);
    }

    // REUSE DETECTION: Check if token is revoked first (before checking expiration)
    // Industry standard: If revoked token is used, revoke entire family (indicates token theft)
    if (refreshTokenDoc.isRevoked()) {
      await RefreshToken.revokeTokenFamily(refreshTokenDoc.familyId);
      logError('Token reuse detected - revoked token family', new Error(`Family ${refreshTokenDoc.familyId} revoked due to reuse`));
      return createSecureErrorResponse('Refresh token has been revoked. Please login again.', 401, request);
    }

    // Idle expiration enforces re-authentication after period of inactivity
    if (refreshTokenDoc.isExpired()) {
      return createSecureErrorResponse('Refresh token expired. Please login again.', 401, request);
    }
    if (refreshTokenDoc.isIdleExpired()) {
      await refreshTokenDoc.markRevoked();
      return createSecureErrorResponse('Refresh token idle expired. Please login again.', 401, request);
    }

    // If old token is used after rotation, it indicates potential token theft
    if (refreshTokenDoc.replacedBy) {
      await RefreshToken.revokeTokenFamily(refreshTokenDoc.familyId);
      logError('Token reuse detected - old token used after rotation', new Error(`Family ${refreshTokenDoc.familyId} revoked`));
      return createSecureErrorResponse('Refresh token has been replaced. Please login again.', 401, request);
    }

    const user = await User.findById(refreshTokenDoc.userId)
      .select('isActive isBlocked role email')
      .lean();

    if (!user || !user.isActive || user.isBlocked) {
      await refreshTokenDoc.markRevoked();
      logError('Token refresh rejected: user inactive', new Error(`User ${refreshTokenDoc.userId} is inactive or blocked`));
      return createSecureErrorResponse('User account is not active', 401, request);
    }

    if (refreshTokenDoc.userId.toString() !== user._id.toString()) {
      await refreshTokenDoc.markRevoked();
      return createSecureErrorResponse('User validation failed', 401, request);
    }

    // Industry standard: Each refresh generates new refresh token, old one is revoked
    const oldFamilyId = refreshTokenDoc.familyId;
    
    const clientInfo = {
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                 request.headers.get('x-real-ip') ||
                 undefined,
    };
    
    const { token: newRefreshToken, refreshToken: newRefreshTokenDoc } = await RefreshToken.createToken(
      refreshTokenDoc.userId.toString(),
      refreshTokenDoc.deviceId,
      clientInfo.userAgent,
      clientInfo.ipAddress
    );

    // Same family ID allows detection if old token is used after rotation (security breach)
    newRefreshTokenDoc.familyId = oldFamilyId;
    await newRefreshTokenDoc.save();

    await refreshTokenDoc.markRevoked(newRefreshTokenDoc._id);

    const responseData: RefreshTokenResponse = {
      success: true,
      message: 'Token refreshed successfully',
    };
    const response = createSecureResponse(responseData, 200, request);
    
    const newAccessToken = generateAccessToken(user._id.toString(), user.email, user.role);
    
    response.cookies.set('auth-token', newAccessToken, {
      httpOnly: true,
      secure: isProduction(),
      sameSite: 'strict',
      maxAge: TIME_DURATIONS.ONE_HOUR,
      path: '/',
    });
    
    response.cookies.set('refresh-token', newRefreshToken, {
      httpOnly: true,
      secure: isProduction(),
      sameSite: 'strict',
      maxAge: TIME_DURATIONS.THIRTY_DAYS,
      path: '/',
    });

    return response;
  } catch (error) {
    logError('refresh token API', error);
    return createSecureErrorResponse('Failed to refresh token', 500, request);
  }
}
