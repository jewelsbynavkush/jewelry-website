import { NextRequest } from 'next/server';
import { contactFormSchema } from '@/lib/validations/schemas';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { sanitizeString, sanitizeEmail, sanitizePhone } from '@/lib/security/sanitize';
import { logError } from '@/lib/security/error-handler';
import { formatZodError } from '@/lib/utils/zod-error';
import type { ContactRequest, ContactResponse } from '@/types/api';

const MAX_REQUEST_SIZE = 10 * 1024;

export async function POST(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting) - stricter for contact form
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 10 requests per 15 minutes
    requireContentType: true,
    maxRequestSize: MAX_REQUEST_SIZE,
  });
  if (securityResponse) return securityResponse;

  try {
    // Validate request size from header to fail fast before parsing body
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return createSecureErrorResponse('Request too large', 413, request);
    }

    // Parse and validate request body - ensures all required contact form fields are present
    let body: ContactRequest;
    try {
      const bodyText = await request.text();
      
      // Double-check actual body size since Content-Length header can be spoofed
      if (bodyText.length > MAX_REQUEST_SIZE) {
        return createSecureErrorResponse('Request too large', 413, request);
      }
      
      body = JSON.parse(bodyText) as ContactRequest;
    } catch {
      return createSecureErrorResponse('Invalid JSON', 400, request);
    }

    // Validate data structure and types using Zod schema
    const validatedData = contactFormSchema.parse(body);

    // Sanitize all inputs to prevent XSS attacks
    const sanitizedData = {
      name: sanitizeString(validatedData.name),
      email: sanitizeEmail(validatedData.email),
      phone: validatedData.phone ? sanitizePhone(validatedData.phone) : undefined,
      message: sanitizeString(validatedData.message),
    };

    // Redundant length checks after sanitization provide defense in depth
    if (sanitizedData.name.length > 100) {
      return createSecureErrorResponse('Name too long', 400, request);
    }
    if (sanitizedData.email.length > 254) {
      return createSecureErrorResponse('Email too long', 400, request);
    }
    if (sanitizedData.message.length > 5000) {
      return createSecureErrorResponse('Message too long', 400, request);
    }

    // Data is validated and sanitized - ready for processing
    // Integration points: email service, database, webhook, or file storage
    
    // Log submission details only in development for debugging
    if (process.env.NODE_ENV === 'development') {
      logError('contact form submission', {
        name: sanitizedData.name,
        email: sanitizedData.email,
        messageLength: sanitizedData.message.length,
      });
    }

    const responseData: ContactResponse = {
      success: true,
      message: 'Thank you for your message. We will get back to you soon!',
    };
    return createSecureResponse(responseData, 200, request);
  } catch (error: unknown) {
    // Check for Zod validation errors first
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    // Log other errors securely without exposing sensitive information
    logError('contact API', error);

    // Return generic error to prevent information disclosure
    return createSecureErrorResponse('Failed to process request', 500, request);
  }
}

// Only allow POST method
export async function GET(request: NextRequest) {
  const securityResponse = applyApiSecurity(request, {
    allowedMethods: ['GET'],
  });
  if (securityResponse) return securityResponse;
  
  const response = createSecureErrorResponse('Method not allowed', 405, request);
  response.headers.set('Allow', 'POST');
  return response;
}

// Handle all other HTTP methods
export async function PUT(request: NextRequest) {
  const securityResponse = applyApiSecurity(request, {
    allowedMethods: ['PUT'],
  });
  if (securityResponse) return securityResponse;
  
  const response = createSecureErrorResponse('Method not allowed', 405, request);
  response.headers.set('Allow', 'POST');
  return response;
}

export async function PATCH(request: NextRequest) {
  const securityResponse = applyApiSecurity(request, {
    allowedMethods: ['PATCH'],
  });
  if (securityResponse) return securityResponse;
  
  const response = createSecureErrorResponse('Method not allowed', 405, request);
  response.headers.set('Allow', 'POST');
  return response;
}

export async function DELETE(request: NextRequest) {
  const securityResponse = applyApiSecurity(request, {
    allowedMethods: ['DELETE'],
  });
  if (securityResponse) return securityResponse;
  
  const response = createSecureErrorResponse('Method not allowed', 405, request);
  response.headers.set('Allow', 'POST');
  return response;
}

