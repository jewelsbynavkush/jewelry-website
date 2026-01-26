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
import { isProduction } from '@/lib/utils/env';
import { SECURITY_CONFIG } from '@/lib/security/constants';

export async function GET(request: NextRequest) {
  // Disable this endpoint in production for security
  if (isProduction()) {
    return createSecureErrorResponse('Not found', 404, request);
  }

  // Apply security (CORS, CSRF, rate limiting)
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.TEST,
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
