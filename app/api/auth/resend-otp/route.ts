/**
 * Resend OTP API Route
 * 
 * Handles OTP resend following industry-standard flow:
 * - POST: Resend OTP to mobile number
 * - Supports both authenticated (for logged-in users) and unauthenticated (post-registration) flows
 * - Industry standard: No session until mobile is verified
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { optionalAuth } from '@/lib/auth/middleware';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { sanitizeString } from '@/lib/security/sanitize';
import { formatZodError } from '@/lib/utils/zod-error';
import { z } from 'zod';
import type { ResendOTPResponse } from '@/types/api';

/**
 * Schema for resend OTP request
 * Supports both authenticated (no mobile needed) and unauthenticated (mobile required) flows
 */
const resendOTPSchema = z.object({
  mobile: z.string().regex(/^[0-9]{10}$/, 'Mobile number must be 10 digits').optional(),
});

/**
 * POST /api/auth/resend-otp
 * Resend OTP to mobile number
 * Industry-standard: Works without authentication for post-registration flow
 */
export async function POST(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  // Stricter rate limiting for OTP resend to prevent abuse
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 5 * 60 * 1000, maxRequests: 10 }, // 10 resends per 5 minutes
    requireContentType: true,
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    // Parse and validate request body (handle empty body for authenticated requests)
    let body: unknown = {};
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch {
      // Empty body is acceptable for authenticated requests
      body = {};
    }
    const validatedData = resendOTPSchema.parse(body);

    // Try to authenticate (optional) - supports post-registration flow
    const authUser = await optionalAuth(request);
    let userDoc;

    if (authUser) {
      // Authenticated: Use authenticated user's mobile
      userDoc = await User.findById(authUser.userId)
        .select('mobile mobileVerified mobileVerificationOTP mobileVerificationOTPExpires');
      if (!userDoc) {
        return createSecureErrorResponse('User not found', 404, request);
      }
    } else {
      // Not authenticated: Require mobile number (post-registration flow)
      if (!validatedData.mobile) {
        return createSecureErrorResponse('Mobile number required when not authenticated', 400, request);
      }
      
      const sanitizedMobile = sanitizeString(validatedData.mobile);
      // Find user by mobile number
      userDoc = await User.findOne({ mobile: sanitizedMobile })
        .select('mobile mobileVerified mobileVerificationOTP mobileVerificationOTPExpires');
      if (!userDoc) {
        // Don't reveal if user exists - security best practice
        return createSecureErrorResponse('If an account exists with this mobile number, an OTP will be sent', 200, request);
      }
    }

    // Security: Only allow resend for unverified users
    // Prevents unnecessary OTP generation for already-verified accounts
    if (userDoc.mobileVerified) {
      return createSecureErrorResponse('Mobile number is already verified', 400, request);
    }

    // Generate new OTP (invalidates previous OTP)
    const otp = userDoc.generateMobileOTP();
    await userDoc.save();

    // TODO: Send OTP via SMS service (Twilio/TextLocal)
    // For now, log OTP in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] OTP for ${userDoc.mobile}: ${otp}`);
    }

    const responseData: ResendOTPResponse = {
      success: true,
      message: 'OTP sent successfully',
    };
    return createSecureResponse(
      {
        ...responseData,
        // Include OTP in development only
        ...(process.env.NODE_ENV === 'development' && { otp }),
      },
      200,
      request
    );
  } catch (error) {
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    logError('resend-otp API', error);
    return createSecureErrorResponse('Failed to resend OTP', 500, request);
  }
}
