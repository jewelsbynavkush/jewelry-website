/**
 * Secure error handling utilities
 * Prevents information leakage in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Sanitize error messages for production
 */
export function sanitizeError(error: unknown): { message: string; details?: unknown } {
  if (isDevelopment) {
    // In development, show full error details
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

  // In production, only show safe messages
  if (error instanceof Error) {
    // Check if it's a known validation error
    if (error.name === 'ZodError' || error.message.includes('validation')) {
      return {
        message: 'Validation failed. Please check your input.',
      };
    }

    // Generic error message for production
    return {
      message: 'An error occurred. Please try again later.',
    };
  }

  return {
    message: 'An unexpected error occurred.',
  };
}

/**
 * Log error securely (don't log sensitive data)
 */
export function logError(context: string, error: unknown) {
  const sanitized = sanitizeError(error);
  
  console.error(`[${context}]`, {
    message: sanitized.message,
    ...(isDevelopment && sanitized.details ? { details: sanitized.details } : {}),
    timestamp: new Date().toISOString(),
  });
}

