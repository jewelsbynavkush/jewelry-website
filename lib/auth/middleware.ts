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
import { getSecurityHeaders } from '@/lib/security/api-headers';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    mobile: string;
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
  // Try Authorization header first (for API clients)
  const authHeader = request.headers.get('authorization');
  let token = extractTokenFromHeader(authHeader);

  // If no token in header, check cookie (for browser clients)
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

  // Verify user still exists and is active
  try {
    await connectDB();
    const user = await User.findById(payload.userId).select('isActive isBlocked role').lean();
    
    if (!user || !user.isActive || user.isBlocked) {
      return null;
    }

    // Verify role hasn't changed
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
      error: NextResponse.json(
        { error: 'Authentication required' },
        {
          status: 401,
          headers: getSecurityHeaders(),
        }
      ),
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
      error: NextResponse.json(
        { error: 'Admin access required' },
        {
          status: 403,
          headers: getSecurityHeaders(),
        }
      ),
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
