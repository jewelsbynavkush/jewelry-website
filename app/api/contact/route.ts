import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { contactFormSchema } from '@/lib/validations/schemas';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { sanitizeString, sanitizeEmail, sanitizePhone } from '@/lib/security/sanitize';
import { logError } from '@/lib/security/error-handler';

// Request size limit (10KB)
const MAX_REQUEST_SIZE = 10 * 1024;

// Security headers helper
function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}

// Validate request origin (basic check)
function isValidOrigin(origin: string | null): boolean {
  if (!origin) return true; // Same-origin requests don't have Origin header
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (baseUrl) {
    try {
      const baseUrlObj = new URL(baseUrl);
      const originObj = new URL(origin);
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
      const originObj = new URL(origin);
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
    // Origin validation
    const origin = request.headers.get('origin');
    if (!isValidOrigin(origin)) {
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

    // Check request size
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
      body = await request.json();
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

    // Validate Firebase is initialized
    if (!db) {
      logError('contact API', new Error('Firebase not initialized - check environment variables'));
      return NextResponse.json(
        { success: false, error: 'Service unavailable' },
        { 
          status: 503,
          headers: getSecurityHeaders(),
        }
      );
    }

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'contacts'), {
      ...sanitizedData,
      createdAt: new Date(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    });

    return NextResponse.json(
      { success: true, id: docRef.id },
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
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: zodError.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
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
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Allow': 'POST',
      },
    }
  );
}

