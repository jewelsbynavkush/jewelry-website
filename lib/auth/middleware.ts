/**
 * Authentication Middleware
 * 
 * Middleware functions for protecting API routes
 * Validates JWT tokens and extracts user information
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, JWTPayload } from './jwt';
import { getAccessTokenFromCookie } from './session';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { createSecureErrorResponse } from '@/lib/security/api-security';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: 'customer' | 'admin' | 'staff';
  };
}

/**
 * Authentication middleware
 * 
 * Validates JWT token from Authorization header or cookie to support both API and browser clients.
 * Verifies user account status and role consistency to invalidate tokens for deactivated users.
 * 
 * @param request - Next.js request object
 * @returns User info if authenticated, null otherwise
 */
export async function authenticateRequest(request: NextRequest): Promise<JWTPayload | null> {
  const authHeader = request.headers.get('authorization');
  let token = extractTokenFromHeader(authHeader);

  // HTTP-only cookies are more secure for browser clients
  if (!token) {
    token = getAccessTokenFromCookie(request.cookies);
  }

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  // Security: Ensures token is invalidated if user is deactivated, blocked, or role changes
  try {
    await connectDB();
    const user = await User.findById(payload.userId).select('isActive isBlocked role').lean();
    
    if (!user || !user.isActive || user.isBlocked) {
      return null;
    }

    // Prevents privilege escalation if admin role is revoked
    if (user.role !== payload.role) {
      return null;
    }

    return payload;
  } catch (error) {
    const { logError } = await import('@/lib/security/error-handler');
    logError('Error verifying user', error);
    return null;
  }
}

/**
 * Require authentication middleware
 * 
 * Enforces authentication for protected routes. Returns 401 if user is not authenticated.
 * 
 * @param request - Next.js request object
 * @returns User payload or error response
 */
export async function requireAuth(request: NextRequest): Promise<{ user: JWTPayload } | { error: NextResponse }> {
  const user = await authenticateRequest(request);

  if (!user) {
    return {
      error: createSecureErrorResponse('Authentication required', 401, request),
    };
  }

  return { user };
}

/**
 * Require admin role middleware
 * 
 * Enforces admin-only access for privileged operations. Returns 403 if user is not admin.
 * 
 * @param request - Next.js request object
 * @returns User payload or error response
 */
export async function requireAdmin(request: NextRequest): Promise<{ user: JWTPayload } | { error: NextResponse }> {
  const authResult = await requireAuth(request);

  if ('error' in authResult) {
    return authResult;
  }

  if (authResult.user.role !== 'admin') {
    return {
      error: createSecureErrorResponse('Admin access required', 403, request),
    };
  }

  return authResult;
}

/**
 * Optional authentication middleware
 * 
 * Attaches user info if token is valid, but allows unauthenticated access.
 * Used for endpoints that behave differently for authenticated vs guest users.
 * 
 * @param request - Next.js request object
 * @returns User payload or null
 */
export async function optionalAuth(request: NextRequest): Promise<JWTPayload | null> {
  return await authenticateRequest(request);
}
