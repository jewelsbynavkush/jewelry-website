/**
 * API Route Helper Utilities
 * 
 * Common patterns extracted from API routes to reduce duplication
 * and ensure consistency across all endpoints
 */

import { NextRequest } from 'next/server';
import { sanitizeString } from '@/lib/security/sanitize';
import { isValidObjectId } from './validation';
import { createSecureErrorResponse } from '@/lib/security/api-security';
import mongoose from 'mongoose';

/**
 * Validate and sanitize ObjectId parameter from route params
 * 
 * Common pattern used across many API routes:
 * - Sanitizes the parameter
 * - Validates ObjectId format
 * - Returns sanitized value or error response
 * 
 * @param param - Parameter value from route params
 * @param paramName - Name of the parameter (for error messages)
 * @param request - NextRequest object for error response
 * @returns Object with sanitized value or error response
 */
export async function validateObjectIdParam(
  param: string,
  paramName: string,
  request: NextRequest
): Promise<{ value: string } | { error: Response }> {
  const sanitized = sanitizeString(param);
  
  if (!isValidObjectId(sanitized)) {
    return {
      error: createSecureErrorResponse(`Invalid ${paramName} format`, 400, request),
    };
  }
  
  return { value: sanitized };
}

/**
 * Validate and sanitize slug parameter from route params
 * 
 * @param param - Parameter value from route params
 * @param paramName - Name of the parameter (for error messages)
 * @param request - NextRequest object for error response
 * @returns Object with sanitized value or error response
 */
export async function validateSlugParam(
  param: string,
  paramName: string,
  request: NextRequest
): Promise<{ value: string } | { error: Response }> {
  const { isValidSlug } = await import('./validation');
  const sanitized = sanitizeString(param);
  
  if (!isValidSlug(sanitized)) {
    return {
      error: createSecureErrorResponse(`Invalid ${paramName}`, 400, request),
    };
  }
  
  return { value: sanitized };
}

/**
 * Extract and validate pagination parameters from query string
 * 
 * Common pattern for pagination across API routes:
 * - Validates limit (1-100)
 * - Validates page (minimum 1)
 * - Returns sanitized values
 * 
 * @param searchParams - URLSearchParams from request URL
 * @returns Object with limit and page values
 */
export function getPaginationParams(searchParams: URLSearchParams): {
  limit: number;
  page: number;
} {
  const limit = Math.min(
    Math.max(parseInt(searchParams.get('limit') || '20', 10), 1),
    100
  ); // 1-100 per page
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1); // Minimum page 1
  
  return { limit, page };
}

/**
 * Get or generate session ID for guest carts
 * 
 * Common pattern used in cart API routes:
 * - Retrieves session ID from cookie if available
 * - Generates new session ID if not found
 * 
 * @param request - NextRequest object
 * @returns Session ID string
 */
export function getSessionId(request: NextRequest): string {
  const sessionCookie = request.cookies.get('session-id');
  if (sessionCookie?.value) {
    return sessionCookie.value;
  }
  
  // Generate new session ID
  return new mongoose.Types.ObjectId().toString();
}
