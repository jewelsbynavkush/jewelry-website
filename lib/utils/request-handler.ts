/**
 * Reusable Request Handler Utilities
 * 
 * Common patterns for API route request handling:
 * - JSON parsing with error handling
 * - Validation with Zod
 * - Consistent error responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSecureErrorResponse, createSecureResponse } from '@/lib/security/api-security';
import { formatZodError } from './zod-error';
import { logError } from '@/lib/security/error-handler';

/**
 * Parse and validate request JSON body
 * 
 * Common pattern used across API routes:
 * - Parses JSON body
 * - Validates with Zod schema
 * - Returns validated data or error response
 * 
 * @param request - NextRequest object
 * @param schema - Zod schema for validation
 * @returns Object with validated data or error response
 */
export async function parseAndValidateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ data: T } | { error: NextResponse }> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    return { data: validatedData };
  } catch (error) {
    // Handle JSON parsing errors separately from validation errors
    // SyntaxError indicates malformed JSON in request body
    if (error instanceof SyntaxError || (error as Error).name === 'SyntaxError') {
      return {
        error: createSecureErrorResponse('Invalid JSON', 400, request),
      };
    }

    // Check for Zod validation errors to provide structured error response
    // Zod errors contain field-level validation details
    const zodError = formatZodError(error);
    if (zodError) {
      return {
        error: createSecureResponse(zodError, 400, request),
      };
    }

    // Log unexpected errors for debugging while returning generic error to client
    // Prevents information disclosure while maintaining error tracking
    logError('request parsing', error);
    return {
      error: createSecureErrorResponse('Invalid request', 400, request),
    };
  }
}
