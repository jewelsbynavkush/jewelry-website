import { NextRequest, NextResponse } from 'next/server';
import { contactFormSchema } from '@/lib/validations/schemas';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { sanitizeString, sanitizeEmail, sanitizePhone } from '@/lib/security/sanitize';
import { logError } from '@/lib/security/error-handler';
import { formatZodError } from '@/lib/utils/zod-error';
import { isDevelopment } from '@/lib/utils/env';
import { SECURITY_CONFIG } from '@/lib/security/constants';
import type { ContactRequest, ContactResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting) - stricter for contact form
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.CONTACT_FORM,
    requireContentType: true,
    maxRequestSize: SECURITY_CONFIG.MAX_REQUEST_SIZE,
  });
  if (securityResponse) return securityResponse;

  try {
    // Validate request size from header to fail fast before parsing body
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > SECURITY_CONFIG.MAX_REQUEST_SIZE) {
      return createSecureErrorResponse('Request too large', 413, request);
    }

    // Validate contact form fields to ensure required data is present and properly formatted
    let body: ContactRequest;
    try {
      const bodyText = await request.text();
      
      // Double-check actual body size since Content-Length header can be spoofed
      if (bodyText.length > SECURITY_CONFIG.MAX_REQUEST_SIZE) {
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
    // Prevents sensitive data exposure in production logs
    if (isDevelopment()) {
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

/**
 * Reject unsupported HTTP methods (only POST is allowed for contact form)
 * Centralized handler for all non-POST methods to reduce code duplication
 */
async function handleUnsupportedMethod(request: NextRequest): Promise<NextResponse> {
  const response = createSecureErrorResponse('Method not allowed', 405, request);
  response.headers.set('Allow', 'POST');
  return response;
}

export async function GET(request: NextRequest) {
  return handleUnsupportedMethod(request);
}

export async function PUT(request: NextRequest) {
  return handleUnsupportedMethod(request);
}

export async function PATCH(request: NextRequest) {
  return handleUnsupportedMethod(request);
}

export async function DELETE(request: NextRequest) {
  return handleUnsupportedMethod(request);
}

