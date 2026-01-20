/**
 * JWT Token Utilities
 * 
 * Handles JWT token generation and verification for authentication
 * Follows security best practices for token management
 */

import jwt from 'jsonwebtoken';
import { logError } from '@/lib/security/error-handler';

// Industry standard OAuth 2.0: Short-lived access tokens
// Access tokens expire quickly (15m-1h) to limit exposure if compromised
// Refresh tokens (stored separately) handle long-term session management
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '1h'; // 1 hour default (industry standard: 15m-1h)

/**
 * Get JWT secret for token signing
 * 
 * Returns the JWT secret from environment variables.
 * Throws an error in production if not set, warns in development.
 * 
 * @returns JWT secret string
 * @throws Error if JWT_SECRET is not set in production
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is not set in production');
    }
    // Use logError for consistent logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      logError('JWT_SECRET environment variable is not set. Using a default for development.', new Error('Missing JWT_SECRET'));
    }
    return 'dev-secret-key-do-not-use-in-production';
  }
  
  return secret;
}

export interface JWTPayload {
  userId: string;
  mobile: string;
  role: 'customer' | 'admin' | 'staff';
  iat?: number;
  exp?: number;
}

/**
 * Generate short-lived access token (JWT)
 * Industry standard: Access tokens are short-lived (15m-1h) for security
 * 
 * @param userId - User ID from MongoDB
 * @param mobile - User mobile number
 * @param role - User role
 * @returns JWT access token string
 */
export function generateAccessToken(userId: string, mobile: string, role: 'customer' | 'admin' | 'staff' = 'customer'): string {
  const JWT_SECRET = getJwtSecret();

  const payload: JWTPayload = {
    userId,
    mobile,
    role,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN as string,
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
export function generateToken(userId: string, mobile: string, role: 'customer' | 'admin' | 'staff' = 'customer'): string {
  return generateAccessToken(userId, mobile, role);
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
