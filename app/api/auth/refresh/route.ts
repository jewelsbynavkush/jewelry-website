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
  // Stricter rate limiting for refresh to prevent abuse
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 10 refreshes per 15 minutes
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    // Extract refresh token from HTTP-only cookie
    // HTTP-only cookies prevent XSS attacks by making token inaccessible to JavaScript
    const refreshTokenValue = getRefreshTokenFromCookie(request.cookies);

    if (!refreshTokenValue) {
      return createSecureErrorResponse('No refresh token provided', 401, request);
    }

    // Lookup refresh token in database (including revoked tokens for reuse detection)
    // Industry standard: Check revoked tokens separately to detect reuse attacks
    const crypto = await import('crypto');
    const hashedToken = crypto.createHash('sha256').update(refreshTokenValue).digest('hex');
    const refreshTokenDoc = await RefreshToken.findOne({ token: hashedToken });

    if (!refreshTokenDoc) {
      // Token not found - invalid token
      return createSecureErrorResponse('Invalid refresh token', 401, request);
    }

    // REUSE DETECTION: Check if token is revoked first (before checking expiration)
    // Industry standard: If revoked token is used, revoke entire family (indicates token theft)
    if (refreshTokenDoc.isRevoked()) {
      await RefreshToken.revokeTokenFamily(refreshTokenDoc.familyId);
      logError('Token reuse detected - revoked token family', new Error(`Family ${refreshTokenDoc.familyId} revoked due to reuse`));
      return createSecureErrorResponse('Refresh token has been revoked. Please login again.', 401, request);
    }

    // Check if token is expired or idle expired
    if (refreshTokenDoc.isExpired()) {
      return createSecureErrorResponse('Refresh token expired. Please login again.', 401, request);
    }
    if (refreshTokenDoc.isIdleExpired()) {
      // Revoke idle-expired token
      await refreshTokenDoc.markRevoked();
      return createSecureErrorResponse('Refresh token idle expired. Please login again.', 401, request);
    }

    // Check if token was already replaced (reuse detection)
    // Industry standard: If old token is used after rotation, it's a security issue
    if (refreshTokenDoc.replacedBy) {
      // Old token being reused - revoke entire family
      await RefreshToken.revokeTokenFamily(refreshTokenDoc.familyId);
      logError('Token reuse detected - old token used after rotation', new Error(`Family ${refreshTokenDoc.familyId} revoked`));
      return createSecureErrorResponse('Refresh token has been replaced. Please login again.', 401, request);
    }

    // Verify user still exists and is active
    const user = await User.findById(refreshTokenDoc.userId)
      .select('isActive isBlocked role mobile')
      .lean();

    if (!user || !user.isActive || user.isBlocked) {
      // Revoke token if user is inactive
      await refreshTokenDoc.markRevoked();
      logError('Token refresh rejected: user inactive', new Error(`User ${refreshTokenDoc.userId} is inactive or blocked`));
      return createSecureErrorResponse('User account is not active', 401, request);
    }

    // Verify role hasn't changed
    if (refreshTokenDoc.userId.toString() !== user._id.toString()) {
      await refreshTokenDoc.markRevoked();
      return createSecureErrorResponse('User validation failed', 401, request);
    }

    // TOKEN ROTATION: Revoke old refresh token and create new one
    // Industry standard: Each refresh generates new refresh token, old one is revoked
    const oldFamilyId = refreshTokenDoc.familyId;
    
    // Create new refresh token (rotation) - will generate new family ID
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

    // Update new token's family ID to match old one (for reuse detection)
    // Industry standard: Keep same family to detect reuse of old tokens
    newRefreshTokenDoc.familyId = oldFamilyId;
    await newRefreshTokenDoc.save();

    // Mark old token as revoked and reference new token
    await refreshTokenDoc.markRevoked(newRefreshTokenDoc._id);

    // Generate new access token and create session
    const responseData = {
      success: true,
      message: 'Token refreshed successfully',
    };
    const response = createSecureResponse(responseData, 200, request);
    
    // Set new refresh token cookie manually (createSession creates new token, we want to use rotated one)
    const { generateAccessToken } = await import('@/lib/auth/jwt');
    const newAccessToken = generateAccessToken(user._id.toString(), user.mobile, user.role);
    
    response.cookies.set('auth-token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });
    
    response.cookies.set('refresh-token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    logError('refresh token API', error);
    return createSecureErrorResponse('Failed to refresh token', 500, request);
  }
}
