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
 * Validates JWT token from Authorization header or cookie
 * Checks both header and cookie to support different client types
 * 
 * @param request - Next.js request object
 * @returns User info if authenticated, null otherwise
 */
export async function authenticateRequest(request: NextRequest): Promise<JWTPayload | null> {
  // Extract token from Authorization header (standard for API clients)
  const authHeader = request.headers.get('authorization');
  let token = extractTokenFromHeader(authHeader);

  // Fallback to cookie-based authentication for browser clients
  // Supports both API clients (header) and browser clients (cookie) for flexibility
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

  // Verify user account status and role consistency
  // Security: Ensures token is invalidated if user is deactivated, blocked, or role changes
  try {
    await connectDB();
    const user = await User.findById(payload.userId).select('isActive isBlocked role').lean();
    
    // Reject authentication if user doesn't exist, is inactive, or is blocked
    if (!user || !user.isActive || user.isBlocked) {
      return null;
    }

    // Reject authentication if user role changed since token was issued
    // Prevents privilege escalation if admin role is revoked
    if (user.role !== payload.role) {
      return null;
    }

    return payload;
  } catch (error) {
    // Use logError to prevent information leakage in production
    const { logError } = await import('@/lib/security/error-handler');
    logError('Error verifying user', error);
    return null;
  }
}

/**
 * Require authentication middleware
 * Returns 401 if user is not authenticated
 * 
 * @param request - Next.js request object
 * @returns User payload or null (with error response)
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
 * Returns 403 if user is not admin
 * 
 * @param request - Next.js request object
 * @returns User payload or null (with error response)
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
 * Attaches user info if token is valid, but doesn't require it
 * 
 * @param request - Next.js request object
 * @returns User payload or null
 */
export async function optionalAuth(request: NextRequest): Promise<JWTPayload | null> {
  return await authenticateRequest(request);
}
