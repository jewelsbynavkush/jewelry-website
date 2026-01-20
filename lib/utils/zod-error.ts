/**
 * Zod Error Utility
 * 
 * Provides helper functions for handling Zod validation errors
 */

import { z } from 'zod';

/**
 * Check if error is a ZodError and return formatted response
 * 
 * @param error - Error to check
 * @returns Formatted error response or null if not a ZodError
 */
export function formatZodError(error: unknown): { error: string; details: Array<{ field: string; message: string }> } | null {
  if (error instanceof z.ZodError) {
    const zodError = error as z.ZodError;
    return {
      error: 'Validation failed',
      details: zodError.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    };
  }
  return null;
}
