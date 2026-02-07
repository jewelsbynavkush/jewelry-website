/**
 * Mongoose Error Handler Utilities
 * 
 * Reusable functions for handling Mongoose errors consistently across API routes.
 * Reduces code duplication and ensures consistent error messages.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';

/**
 * Handle Mongoose validation errors
 * 
 * @param error - Error object from Mongoose
 * @returns Formatted error messages array or null if not a validation error
 */
export function extractMongooseValidationErrors(error: unknown): string[] | null {
  if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
    const errors = 'errors' in error && error.errors 
      ? Object.values(error.errors).map((err: unknown) => 
          err && typeof err === 'object' && 'message' in err 
            ? String(err.message) 
            : 'Validation error'
        )
      : [];
    return errors.length > 0 ? errors : ['Validation error'];
  }
  return null;
}

/**
 * Handle Mongoose duplicate key errors (unique constraint violations)
 * 
 * @param error - Error object from Mongoose
 * @returns Field name that caused the duplicate or null if not a duplicate key error
 */
export function extractMongooseDuplicateKeyError(error: unknown): string | null {
  if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
    const keyPattern = 'keyPattern' in error && error.keyPattern 
      ? error.keyPattern as Record<string, unknown>
      : {};
    const field = Object.keys(keyPattern)[0];
    return field || null;
  }
  return null;
}

/**
 * Get user-friendly error message for duplicate key errors
 * 
 * @param field - Field name that caused the duplicate
 * @returns User-friendly error message
 */
export function getDuplicateKeyErrorMessage(field: string): string {
  const fieldMessages: Record<string, string> = {
    email: 'Email already in use',
    mobile: 'Mobile number already in use',
    username: 'Username already taken',
    slug: 'Slug already exists',
  };
  
  return fieldMessages[field] || `${field} already exists`;
}

/**
 * Handle Mongoose save errors and return appropriate error response
 * 
 * This function handles:
 * - Validation errors (returns 400 with field-specific messages)
 * - Duplicate key errors (returns 400 with user-friendly message)
 * - Other errors (re-throws for outer catch block)
 * 
 * @param error - Error from Mongoose save operation
 * @param request - Next.js request object
 * @param context - Context string for logging (e.g., 'user profile update')
 * @returns Error response or null if error should be re-thrown
 */
export function handleMongooseSaveError(
  error: unknown,
  request: NextRequest,
  context: string
): NextResponse | null {
  // Extract validation errors to provide field-specific feedback to users
  // Mongoose validation errors contain detailed field-level messages
  const validationErrors = extractMongooseValidationErrors(error);
  if (validationErrors) {
    logError(`${context} - validation error`, error);
    return createSecureErrorResponse(
      validationErrors.join(', ') || 'Validation error',
      400,
      request
    );
  }
  
  // Extract duplicate key field to provide user-friendly error messages
  // MongoDB error code 11000 indicates unique constraint violation
  const duplicateField = extractMongooseDuplicateKeyError(error);
  if (duplicateField) {
    logError(`${context} - duplicate key error`, error);
    return createSecureErrorResponse(
      getDuplicateKeyErrorMessage(duplicateField),
      400,
      request
    );
  }
  
  // Return null to allow outer catch block to handle unexpected errors
  // This ensures proper error propagation for non-Mongoose errors
  return null;
}

/**
 * Handle Mongoose errors in catch blocks
 * 
 * Processes Mongoose-specific errors (validation, duplicate keys) and returns
 * appropriate HTTP error responses. Should be used in catch blocks after Zod
 * validation to handle database-level errors.
 * 
 * @param error - Error from catch block
 * @param request - Next.js request object
 * @param context - Context string for logging (e.g., 'orders POST API')
 * @returns Error response or null if error should be handled by outer catch block
 */
export function handleMongooseError(
  error: unknown,
  request: NextRequest,
  context: string
): NextResponse | null {
  // Check for Mongoose validation errors first to provide generic validation feedback
  // Used in catch blocks where field-specific details may not be needed
  const validationErrors = extractMongooseValidationErrors(error);
  if (validationErrors) {
    logError(`${context} - validation error`, error);
    return createSecureErrorResponse(
      'Validation failed. Please check your input.',
      400,
      request
    );
  }
  
  // Check for duplicate key violations to provide user-friendly conflict messages
  // MongoDB error code 11000 indicates unique constraint violation
  const duplicateField = extractMongooseDuplicateKeyError(error);
  if (duplicateField) {
    logError(`${context} - duplicate key error`, error);
    return createSecureErrorResponse(
      getDuplicateKeyErrorMessage(duplicateField),
      400,
      request
    );
  }
  
  // Return null to allow outer catch block to handle non-Mongoose errors
  // Enables proper error propagation for unexpected error types
  return null;
}
