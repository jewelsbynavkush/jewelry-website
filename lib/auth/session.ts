/**
 * Session Management Utilities
 * 
 * Industry standard OAuth 2.0 session management:
 * - Short-lived access tokens (1 hour) in HTTP-only cookies
 * - Long-lived refresh tokens (30 days) in separate HTTP-only cookies
 * - Token rotation and reuse detection
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateAccessToken } from './jwt';
import RefreshToken from '@/models/RefreshToken';

const ACCESS_TOKEN_COOKIE = 'auth-token'; // Short-lived access token
const REFRESH_TOKEN_COOKIE = 'refresh-token'; // Long-lived refresh token
const ACCESS_TOKEN_MAX_AGE = 60 * 60; // 1 hour in seconds
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Get client device/user agent info for token tracking
 */
function getClientInfo(request?: NextRequest): { userAgent?: string; ipAddress?: string } {
  if (!request) return {};
  
  return {
    userAgent: request.headers.get('user-agent') || undefined,
    ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               request.headers.get('x-real-ip') ||
               undefined,
  };
}

/**
 * Create authenticated session with access and refresh tokens
 * Industry standard: Issues both short-lived access token and long-lived refresh token
 * 
 * @param userId - User ID
 * @param mobile - User mobile number
 * @param role - User role
 * @param response - Next.js response object
 * @param request - Next.js request object (for device tracking)
 * @returns Response with Set-Cookie headers
 */
export async function createSession(
  userId: string,
  mobile: string,
  role: 'customer' | 'admin' | 'staff' = 'customer',
  response: NextResponse,
  request?: NextRequest
): Promise<NextResponse> {
  // Generate short-lived access token (1 hour)
  const accessToken = generateAccessToken(userId, mobile, role);
  
  // Generate refresh token and store in database
  const clientInfo = getClientInfo(request);
  const { token: refreshToken } = await RefreshToken.createToken(
    userId,
    undefined, // deviceId (optional)
    clientInfo.userAgent,
    clientInfo.ipAddress
  );
  
  // Set access token cookie (short-lived)
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: ACCESS_TOKEN_MAX_AGE,
    path: '/',
  });
  
  // Set refresh token cookie (long-lived)
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: '/',
  });

  return response;
}

/**
 * Clear session (logout)
 * Removes both access and refresh token cookies
 * Industry standard: Also revokes refresh tokens in database
 * 
 * @param response - Next.js response object
 * @param userId - User ID (optional, for revoking refresh tokens)
 * @returns Response with cleared cookies
 */
export async function clearSession(response: NextResponse, userId?: string): Promise<NextResponse> {
  // Clear cookies
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  
  // Revoke all refresh tokens for user (industry standard: revoke on logout)
  if (userId) {
    try {
      await RefreshToken.revokeUserTokens(userId);
    } catch (error) {
      // Log but don't fail logout if revocation fails
      const { logError } = await import('@/lib/security/error-handler');
      logError('Failed to revoke refresh tokens on logout', error);
    }
  }
  
  return response;
}

/**
 * Get access token from cookie
 * 
 * @param cookies - Cookie store
 * @returns Access token string or null
 */
export function getAccessTokenFromCookie(cookies: { get: (name: string) => { value: string } | undefined }): string | null {
  const cookie = cookies.get(ACCESS_TOKEN_COOKIE);
  return cookie?.value || null;
}

/**
 * Get refresh token from cookie
 * 
 * @param cookies - Cookie store
 * @returns Refresh token string or null
 */
export function getRefreshTokenFromCookie(cookies: { get: (name: string) => { value: string } | undefined }): string | null {
  const cookie = cookies.get(REFRESH_TOKEN_COOKIE);
  return cookie?.value || null;
}

/**
 * Get token from cookie (backward compatibility - returns access token)
 * @deprecated Use getAccessTokenFromCookie instead
 */
export function getTokenFromCookie(cookies: { get: (name: string) => { value: string } | undefined }): string | null {
  return getAccessTokenFromCookie(cookies);
}
