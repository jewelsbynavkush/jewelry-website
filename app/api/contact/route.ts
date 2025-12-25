import { NextRequest, NextResponse } from 'next/server';
import { contactFormSchema } from '@/lib/validations/schemas';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { sanitizeString, sanitizeEmail, sanitizePhone } from '@/lib/security/sanitize';
import { logError } from '@/lib/security/error-handler';
import { getSecurityHeaders } from '@/lib/security/api-headers';

const MAX_REQUEST_SIZE = 10 * 1024;

/**
 * Validates request origin for CSRF protection
 */
function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // Same-origin requests may not have Origin header
  // Check Referer header as fallback
  const originToCheck = origin || referer;
  
  if (!originToCheck) {
    // No origin or referer - could be same-origin or direct API call
    // In production, be more strict
    if (process.env.NODE_ENV === 'production') {
      return false;
    }
    // In development, allow (for testing)
    return true;
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (baseUrl) {
    try {
      const baseUrlObj = new URL(baseUrl);
      const originObj = new URL(originToCheck);
      // Allow same origin
      if (originObj.origin === baseUrlObj.origin) return true;
    } catch {
      // Invalid URL, reject
      return false;
    }
  }
  
  // In development, allow localhost
  if (process.env.NODE_ENV === 'development') {
    try {
      const originObj = new URL(originToCheck);
      if (originObj.hostname === 'localhost' || originObj.hostname === '127.0.0.1') {
        return true;
      }
    } catch {
      return false;
    }
  }
  
  // For production, only allow same origin
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Origin validation (CSRF protection)
    if (!isValidOrigin(request)) {
      return NextResponse.json(
        { success: false, error: 'Invalid origin' },
        { 
          status: 403,
          headers: getSecurityHeaders(),
        }
      );
    }

    // Rate limiting
    const rateLimit = checkRateLimit(request, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 10, // 10 requests per 15 minutes for contact form
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            ...getSecurityHeaders(),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          },
        }
      );
    }

    // Check content type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Invalid content type' },
        { 
          status: 400,
          headers: getSecurityHeaders(),
        }
      );
    }

    // Check request size (validate both header and actual body)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Request too large' },
        { 
          status: 413,
          headers: getSecurityHeaders(),
        }
      );
    }

    // Parse and validate body
    let body;
    try {
      const bodyText = await request.text();
      
      // Validate actual body size (not just Content-Length header)
      if (bodyText.length > MAX_REQUEST_SIZE) {
        return NextResponse.json(
          { success: false, error: 'Request too large' },
          { 
            status: 413,
            headers: getSecurityHeaders(),
          }
        );
      }
      
      body = JSON.parse(bodyText);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON' },
        { 
          status: 400,
          headers: getSecurityHeaders(),
        }
      );
    }

    // Validate data with Zod
    const validatedData = contactFormSchema.parse(body);

    // Sanitize input
    const sanitizedData = {
      name: sanitizeString(validatedData.name),
      email: sanitizeEmail(validatedData.email),
      phone: validatedData.phone ? sanitizePhone(validatedData.phone) : undefined,
      message: sanitizeString(validatedData.message),
    };

    // Additional validation: field lengths (redundant but extra safety)
    if (sanitizedData.name.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Name too long' },
        { 
          status: 400,
          headers: getSecurityHeaders(),
        }
      );
    }
    if (sanitizedData.email.length > 254) {
      return NextResponse.json(
        { success: false, error: 'Email too long' },
        { 
          status: 400,
          headers: getSecurityHeaders(),
        }
      );
    }
    if (sanitizedData.message.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Message too long' },
        { 
          status: 400,
          headers: getSecurityHeaders(),
        }
      );
    }

    // Contact form submission - data validated and sanitized
    // Note: Currently just returns success. You can add:
    // - Email sending (using nodemailer, sendgrid, etc.)
    // - Save to JSON file
    // - Save to database
    // - Webhook to external service
    
    // Log submission (optional - for debugging)
    // Using logError utility for consistent logging
    if (process.env.NODE_ENV === 'development') {
      logError('contact form submission', {
        name: sanitizedData.name,
        email: sanitizedData.email,
        messageLength: sanitizedData.message.length,
      });
    }

    return NextResponse.json(
      { success: true, message: 'Thank you for your message. We will get back to you soon!' },
      { 
        status: 200,
        headers: {
          ...getSecurityHeaders(),
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
        },
      }
    );
  } catch (error: unknown) {
    // Don't expose internal errors to client
    logError('contact API', error);
    
    // Handle Zod validation errors
    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'ZodError' &&
      'errors' in error
    ) {
      const zodError = error as { errors: Array<{ path: (string | number)[]; message: string }> };
      
      // In production, limit error details to prevent information disclosure
      const isProduction = process.env.NODE_ENV === 'production';
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          // Only include field-level details in development
          ...(isProduction ? {} : {
            details: zodError.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          }),
        },
        { 
          status: 400,
          headers: getSecurityHeaders(),
        }
      );
    }

    // Generic error response
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { 
        status: 500,
        headers: getSecurityHeaders(),
      }
    );
  }
}

// Only allow POST method
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        ...getSecurityHeaders(),
        'Allow': 'POST',
      },
    }
  );
}

// Handle all other HTTP methods
export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        ...getSecurityHeaders(),
        'Allow': 'POST',
      },
    }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        ...getSecurityHeaders(),
        'Allow': 'POST',
      },
    }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        ...getSecurityHeaders(),
        'Allow': 'POST',
      },
    }
  );
}

