/**
 * Email Verification API Route
 * 
 * Handles email OTP verification:
 * - POST: Verify email address with OTP
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth/middleware';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { sanitizeEmail } from '@/lib/security/sanitize';
import { formatZodError } from '@/lib/utils/zod-error';
import { z } from 'zod';
import type { VerifyEmailRequest, VerifyEmailResponse } from '@/types/api';

/**
 * Schema for email verification
 * Requires authentication and OTP
 */
const verifyEmailSchema = z.object({
  otp: z.string().regex(/^[0-9]{6}$/, 'OTP must be 6 digits'),
  email: z.string().email('Invalid email format').optional(),
});

/**
 * POST /api/auth/verify-email
 * Verify email address with OTP
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

    // Parse and validate request body
    const body = await request.json() as VerifyEmailRequest;
    const validatedData = verifyEmailSchema.parse(body);

    // Require authentication for email verification
    const authResult = await requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { user: authUser } = authResult;

    // Fetch user document with only email verification fields to minimize data exposure
    const userDoc = await User.findById(authUser.userId)
      .select('email emailVerified emailVerificationOTP emailVerificationOTPExpires');
    if (!userDoc) {
      return createSecureErrorResponse('User not found', 404, request);
    }

    // Verify email exists
    if (!userDoc.email) {
      return createSecureErrorResponse('No email address associated with this account', 400, request);
    }

    // If email provided in request, verify it matches user's email
    if (validatedData.email) {
      const sanitizedEmail = sanitizeEmail(validatedData.email);
      if (userDoc.email !== sanitizedEmail) {
        return createSecureErrorResponse('Email does not match account email', 400, request);
      }
    }

    // Security: Only allow verification for unverified emails
    // Prevents unnecessary verification of already-verified accounts
    if (userDoc.emailVerified) {
      return createSecureErrorResponse('Email is already verified', 400, request);
    }

    // Verify OTP
    const isValid = userDoc.verifyEmailOTP(validatedData.otp);
    if (!isValid) {
      return createSecureErrorResponse('Invalid or expired OTP', 400, request);
    }

    // Mark email as verified
    userDoc.emailVerified = true;
    userDoc.emailVerificationOTP = undefined;
    userDoc.emailVerificationOTPExpires = undefined;
    await userDoc.save();

    const responseData: VerifyEmailResponse = {
      success: true,
      message: 'Email verified successfully',
      user: {
        id: userDoc._id.toString(),
        email: userDoc.email,
        emailVerified: userDoc.emailVerified,
      },
    };
    
    return createSecureResponse(responseData, 200, request);
  } catch (error) {
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    logError('verify-email API', error);
    return createSecureErrorResponse('Failed to verify email', 500, request);
  }
}
