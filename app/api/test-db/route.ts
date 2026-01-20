/**
 * Test Database Connection API Route
 * 
 * Development/testing endpoint to verify database connectivity
 * Note: This endpoint should be disabled or restricted in production
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';

export async function GET(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  // Note: Consider disabling this endpoint in production or adding IP restrictions
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 requests per minute
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();
    
    return createSecureResponse(
      { 
        success: true,
        message: 'Database connected successfully!',
        timestamp: new Date().toISOString()
      },
      200,
      request
    );
  } catch (error) {
    logError('test-db API', error);
    return createSecureErrorResponse(
      'Database connection failed',
      500,
      request
    );
  }
}
