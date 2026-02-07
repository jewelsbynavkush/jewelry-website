/**
 * Email Verification API Route
 * 
 * Handles email OTP verification:
 * - POST: Verify email address with OTP
 * - Supports both authenticated and unauthenticated flows (for post-registration)
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { optionalAuth } from '@/lib/auth/middleware';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { sanitizeEmail } from '@/lib/security/sanitize';
import { formatZodError } from '@/lib/utils/zod-error';
import { SECURITY_CONFIG } from '@/lib/security/constants';
import { z } from 'zod';
import type { VerifyEmailRequest, VerifyEmailResponse } from '@/types/api';

/**
 * Schema for email verification with industry-standard validation
 * Supports both authenticated (OTP only) and unauthenticated (email + OTP) flows
 */
const verifyEmailSchema = z.object({
  otp: z
    .string()
    .min(1, 'OTP is required')
    .regex(/^[0-9]{6}$/, 'OTP must be exactly 6 digits'),
  email: z
    .string()
    .max(254, 'Email must not exceed 254 characters')
    .email('Invalid email format')
    .toLowerCase()
    .trim()
    .optional(),
});

/**
 * POST /api/auth/verify-email
 * Verify email address with OTP
 */
export async function POST(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  // Industry standard: 10 verification attempts per 15 minutes (same for all environments)
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.AUTH_VERIFY,
    requireContentType: true,
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    const body = await request.json() as VerifyEmailRequest;
    
    // Deobfuscate sensitive fields (otp) that were obfuscated on client side
    // Industry standard: Reverse client-side obfuscation to get original OTP
    // Handles both obfuscated (from web client) and plain text (from direct API calls) OTPs
    const { deobfuscateRequestFields } = await import('@/lib/security/request-decryption');
    const deobfuscatedBody = deobfuscateRequestFields(
      body as unknown as Record<string, unknown>, 
      ['otp']
    ) as unknown as VerifyEmailRequest;
    
    const validatedData = verifyEmailSchema.parse(deobfuscatedBody);

    // Support both authenticated (OTP only) and unauthenticated (email + OTP) flows
    const authResult = await optionalAuth(request);
    let userDoc;

    if (authResult) {
      // Authenticated flow: Verify the authenticated user's email
      // Must use document (not .lean()) to call .save() after verification
      userDoc = await User.findById(authResult.userId)
        .select('_id email emailVerified emailVerificationOTP emailVerificationOTPExpires');
      if (!userDoc) {
        return createSecureErrorResponse('User not found', 404, request);
      }

      // Validate provided email matches authenticated user's email
      if (validatedData.email) {
        const sanitizedEmail = sanitizeEmail(validatedData.email);
        if (userDoc.email !== sanitizedEmail) {
          return createSecureErrorResponse('Email does not match account email', 400, request);
        }
      }
    } else {
      // Unauthenticated flow: Require email for initial verification after registration
      if (!validatedData.email) {
        return createSecureErrorResponse('Email required. Please include your email in the request body: { "otp": "123456", "email": "user@example.com" }', 400, request);
      }
      
      const sanitizedEmail = sanitizeEmail(validatedData.email);
      // Must use document (not .lean()) to call .save() after verification
      userDoc = await User.findOne({ email: sanitizedEmail })
        .select('_id email emailVerified emailVerificationOTP emailVerificationOTPExpires');
      if (!userDoc) {
        return createSecureErrorResponse('User not found', 404, request);
      }
      
      // Prevent unauthorized verification of already-verified accounts
      if (userDoc.emailVerified) {
        return createSecureErrorResponse('Email already verified. Please login to verify again.', 400, request);
      }
    }

    // Prevent redundant verification attempts
    if (userDoc.emailVerified) {
      return createSecureErrorResponse('Email is already verified', 400, request);
    }

    // Verify OTP using timing-safe comparison to prevent timing attacks
    const isValid = userDoc.verifyEmailOTP(validatedData.otp);
    if (!isValid) {
      return createSecureErrorResponse('Invalid or expired OTP', 400, request);
    }

    // Mark email as verified
    userDoc.emailVerified = true;
    userDoc.emailVerificationOTP = undefined;
    userDoc.emailVerificationOTPExpires = undefined;
    await userDoc.save();

    // Fetch minimal user fields for session creation (excludes password and sensitive data)
    // Use .lean() for performance since this is read-only
    const fullUser = await User.findById(userDoc._id)
      .select('_id email firstName lastName role')
      .lean();
    if (!fullUser) {
      return createSecureErrorResponse('User not found', 404, request);
    }

    const responseData: VerifyEmailResponse = {
      success: true,
      message: 'Email verified successfully',
      user: {
        id: userDoc._id.toString(),
        email: userDoc.email,
        emailVerified: userDoc.emailVerified,
        firstName: fullUser.firstName,
        lastName: fullUser.lastName,
        role: fullUser.role,
      },
    };
    
    const response = createSecureResponse(responseData, 200, request);

    // Create session after verification to authenticate user
    const { createSession } = await import('@/lib/auth/session');
    await createSession(fullUser._id.toString(), fullUser.email, fullUser.role, response, request);

    // Preserve guest cart items by merging into user cart
    try {
      const { mergeGuestCartToUser } = await import('@/lib/cart/merge-cart');
      const { getSessionId } = await import('@/lib/utils/api-helpers');
      const sessionId = getSessionId(request);
      await mergeGuestCartToUser(fullUser._id.toString(), sessionId);
    } catch (error) {
      // Don't fail verification if cart merge fails
      logError('cart merge on verify-email', error);
    }
    
    return response;
  } catch (error) {
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    logError('verify-email API', error);
    return createSecureErrorResponse('Failed to verify email', 500, request);
  }
}
