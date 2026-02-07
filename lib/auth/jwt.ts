/**
 * JWT Token Utilities
 * 
 * Handles JWT token generation and verification for authentication
 * Follows security best practices for token management
 */

import jwt from 'jsonwebtoken';
import { getJwtSecret, getAccessTokenExpiresIn } from '@/lib/utils/env';

// Industry standard OAuth 2.0: Short-lived access tokens
// Access tokens expire quickly (15m-1h) to limit exposure if compromised
// Refresh tokens (stored separately) handle long-term session management

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'customer' | 'admin' | 'staff';
  iat?: number;
  exp?: number;
}

/**
 * Generate short-lived access token (JWT)
 * Industry standard: Access tokens are short-lived (15m-1h) for security
 * 
 * @param userId - User ID from MongoDB
 * @param email - User email address
 * @param role - User role
 * @returns JWT access token string
 */
export function generateAccessToken(userId: string, email: string, role: 'customer' | 'admin' | 'staff' = 'customer'): string {
  const JWT_SECRET = getJwtSecret();

  const payload: JWTPayload = {
    userId,
    email,
    role,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: getAccessTokenExpiresIn(),
    issuer: 'jewelry-website',
    audience: 'jewelry-website-users',
  } as jwt.SignOptions);
  
  if (typeof token !== 'string') {
    throw new Error('Failed to generate access token');
  }
  
  return token;
}

/**
 * Generate JWT token (backward compatibility - now generates access token)
 * @deprecated Use generateAccessToken instead
 */
export function generateToken(userId: string, email: string, role: 'customer' | 'admin' | 'staff' = 'customer'): string {
  return generateAccessToken(userId, email, role);
}

/**
 * Verify and decode JWT token
 * 
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const JWT_SECRET = getJwtSecret();
    
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'jewelry-website',
      audience: 'jewelry-website-users',
    }) as JWTPayload;

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Extract token from Authorization header
 * 
 * @param authHeader - Authorization header value (e.g., "Bearer <token>")
 * @returns Token string or null
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
