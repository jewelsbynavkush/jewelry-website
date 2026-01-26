/**
 * Secure error handling utilities
 * Prevents information leakage in production
 */

import logger from '@/lib/utils/logger';
import { isDevelopment, isTest } from '@/lib/utils/env';

/**
 * Sanitize error messages for production
 */
export function sanitizeError(error: unknown): { message: string; details?: unknown } {
  if (isDevelopment()) {
    // Full error details aid debugging in development
    if (error instanceof Error) {
      return {
        message: error.message,
        details: {
          stack: error.stack,
          name: error.name,
        },
      };
    }
    return {
      message: String(error),
      details: error,
    };
  }

  // Production: return generic messages to prevent information disclosure
  if (error instanceof Error) {
    // Validation errors are safe to expose as they don't reveal system internals
    if (error.name === 'ZodError' || error.message.includes('validation')) {
      return {
        message: 'Validation failed. Please check your input.',
      };
    }

    // Generic message prevents attackers from learning about system internals
    return {
      message: 'An error occurred. Please try again later.',
    };
  }

  return {
    message: 'An unexpected error occurred.',
  };
}

/**
 * Generate a correlation ID for request tracking
 */
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get correlation ID from request headers or generate a new one
 */
export function getCorrelationId(request?: Request): string {
  if (request) {
    const existingId = request.headers.get('x-correlation-id') || 
                       request.headers.get('x-request-id');
    if (existingId) {
      return existingId;
    }
  }
  return generateCorrelationId();
}

/**
 * Log error securely (don't log sensitive data)
 */
export function logError(context: string, error: unknown, correlationId?: string) {
  const sanitized = sanitizeError(error);
  
  // Always log full error details in test environment for debugging
  const shouldLogDetails = isDevelopment() || isTest();
  
  const logData: Record<string, unknown> = {
    message: sanitized.message,
    ...(correlationId ? { correlationId } : {}),
    ...(shouldLogDetails && sanitized.details ? { details: sanitized.details } : {}),
    ...(shouldLogDetails && error instanceof Error ? { 
      stack: error.stack,
      name: error.name,
      message: error.message 
    } : {}),
  };
  
  logger.error(`${context}${correlationId ? ` [${correlationId}]` : ''}`, error, logData);
}

