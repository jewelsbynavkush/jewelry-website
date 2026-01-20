/**
 * Mobile Verification API Route
 * 
 * Handles mobile OTP verification:
 * - POST: Verify mobile number with OTP
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { optionalAuth } from '@/lib/auth/middleware';
import { createSession } from '@/lib/auth/session';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { sanitizeString } from '@/lib/security/sanitize';
import { formatZodError } from '@/lib/utils/zod-error';
import { mergeGuestCartToUser } from '@/lib/cart/merge-cart';
import { z } from 'zod';
import type { VerifyMobileRequest, VerifyMobileResponse } from '@/types/api';

/**
 * Schema for mobile verification
 * Supports both authenticated (OTP only) and unauthenticated (mobile + OTP) verification
 */
const verifyMobileSchema = z.object({
  otp: z.string().regex(/^[0-9]{6}$/, 'OTP must be 6 digits'),
  mobile: z.string().regex(/^[0-9]{10}$/, 'Mobile number must be 10 digits').optional(),
});

/**
 * POST /api/auth/verify-mobile
 * Verify mobile number with OTP
 */
export async function POST(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  // Industry standard: 10 verification attempts per 15 minutes (same for all environments)
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 50 }, // 50 verification attempts per 15 minutes
    requireContentType: true,
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    // Parse and validate request body - ensures OTP format and mobile number format are correct
    const body = await request.json() as VerifyMobileRequest;
    const validatedData = verifyMobileSchema.parse(body);

    // Try to authenticate (optional) - if authenticated, use userId; otherwise require mobile
    const authUser = await optionalAuth(request);
    let userDoc;

    if (authUser) {
      // Authenticated: Verify the authenticated user's mobile
      userDoc = await User.findById(authUser.userId)
        .select('mobile email firstName lastName role mobileVerified emailVerified mobileVerificationOTP mobileVerificationOTPExpires');
      if (!userDoc) {
        return createSecureErrorResponse('User not found', 404, request);
      }
    } else {
      // Not authenticated or token expired: Require mobile number in request body
      if (!validatedData.mobile) {
        return createSecureErrorResponse('Mobile number required. Please include your mobile number in the request body: { "otp": "123456", "mobile": "1234567890" }', 400, request);
      }
      
      const sanitizedMobile = sanitizeString(validatedData.mobile);
      // Find user by mobile number for initial verification after registration
      userDoc = await User.findOne({ mobile: sanitizedMobile })
        .select('mobile email firstName lastName role mobileVerified emailVerified mobileVerificationOTP mobileVerificationOTPExpires');
      if (!userDoc) {
        return createSecureErrorResponse('User not found', 404, request);
      }
      
      // Security: Only allow unauthenticated verification for unverified users
      // Prevents unauthorized verification of already-verified accounts
      if (userDoc.mobileVerified) {
        return createSecureErrorResponse('Mobile number already verified. Please login to verify again.', 400, request);
      }
    }

    // Verify OTP
    const isValid = userDoc.verifyMobileOTP(validatedData.otp);
    if (!isValid) {
      return createSecureErrorResponse('Invalid or expired OTP', 400, request);
    }

    // Mark mobile as verified
    userDoc.mobileVerified = true;
    userDoc.mobileVerificationOTP = undefined;
    userDoc.mobileVerificationOTPExpires = undefined;
    await userDoc.save();

    const responseData: VerifyMobileResponse = {
      success: true,
      message: 'Mobile number verified successfully',
      user: {
        id: userDoc._id.toString(),
        mobile: userDoc.mobile,
        firstName: userDoc.firstName,
        lastName: userDoc.lastName,
        email: userDoc.email,
        role: userDoc.role,
        mobileVerified: userDoc.mobileVerified,
        emailVerified: userDoc.emailVerified,
      },
    };
    
    // Create session with access token and refresh token after successful mobile verification
    // Industry standard: Separate short-lived access tokens and long-lived refresh tokens
    const response = createSecureResponse(responseData, 200, request);
    await createSession(userDoc._id.toString(), userDoc.mobile, userDoc.role, response, request);

    // Merge guest cart into user cart (industry standard: preserve guest cart on registration/verification)
    // Get sessionId from cookie if available
    const sessionCookie = request.cookies.get('session-id');
    if (sessionCookie?.value) {
      try {
        await mergeGuestCartToUser(userDoc._id.toString(), sessionCookie.value);
      } catch (error) {
        // Log error but don't fail verification - cart merge is non-critical
        logError('cart merge on verify-mobile', error);
      }
    }
    
    return response;
  } catch (error) {
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    logError('verify-mobile API', error);
    return createSecureErrorResponse('Failed to verify mobile number', 500, request);
  }
}
