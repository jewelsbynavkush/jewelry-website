/**
 * Resend OTP API Route
 * 
 * Handles email OTP resend following industry-standard flow:
 * - POST: Resend OTP to email address
 * - Supports both authenticated (for logged-in users) and unauthenticated (post-registration) flows
 * - Industry standard: No session until email is verified
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
import type { ResendOTPResponse } from '@/types/api';

/**
 * Schema for resend OTP request
 * Supports both authenticated (no email needed) and unauthenticated (email required) flows
 */
const resendOTPSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
});

/**
 * POST /api/auth/resend-otp
 * Resend OTP to email address
 * Industry-standard: Works without authentication for post-registration flow
 */
export async function POST(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  // Stricter rate limiting for OTP resend to prevent abuse
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.AUTH_RESEND_OTP,
    requireContentType: true,
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    // Handle both authenticated and unauthenticated OTP resend requests
    // Authenticated requests may omit body (uses user from session)
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
      // Authenticated: Use authenticated user's email
      userDoc = await User.findById(authUser.userId)
        .select('email emailVerified emailVerificationOTP emailVerificationOTPExpires');
      if (!userDoc) {
        return createSecureErrorResponse('User not found', 404, request);
      }
    } else {
      // Not authenticated: Require email (post-registration flow)
      if (!validatedData.email) {
        return createSecureErrorResponse('Email required when not authenticated', 400, request);
      }
      
      const sanitizedEmail = sanitizeEmail(validatedData.email);
      // Lookup user by email (primary identifier for OTP resend)
      userDoc = await User.findOne({ email: sanitizedEmail })
        .select('email emailVerified emailVerificationOTP emailVerificationOTPExpires');
      
      if (!userDoc) {
        // Don't reveal if user exists - security best practice
        return createSecureErrorResponse('If an account exists with this email, an OTP will be sent', 200, request);
      }
    }

    // Verify email exists before generating OTP
    // Prevents OTP generation for accounts without email addresses
    if (!userDoc.email) {
      return createSecureErrorResponse('No email address associated with this account', 400, request);
    }

    // Security: Only allow resend for unverified users
    // Prevents unnecessary OTP generation for already-verified accounts
    if (userDoc.emailVerified) {
      return createSecureErrorResponse('Email is already verified', 400, request);
    }

    // Generate new OTP (invalidates previous OTP)
    const otp = userDoc.generateEmailOTP();
    await userDoc.save();

    // Send OTP email via Gmail SMTP for email verification
    // Security: OTP is time-limited (10 minutes) to prevent unauthorized access
    const { sendEmailOTP } = await import('@/lib/email/gmail');
    const emailResult = await sendEmailOTP(userDoc.email, otp);
    
    if (!emailResult.success) {
      logError('Failed to send Email OTP', {
        error: emailResult.error,
        email: userDoc.email,
      });
      // Don't fail the request - OTP is generated, user can request again
    } else {
      const logger = (await import('@/lib/utils/logger')).default;
      logger.info('Email OTP sent successfully', {
        email: userDoc.email,
        messageId: emailResult.messageId,
      });
    }

    // Log OTP in development for testing
    const { isDevelopment } = await import('@/lib/utils/env');
    if (isDevelopment()) {
      const logger = (await import('@/lib/utils/logger')).default;
      logger.debug('Email OTP generated', { email: userDoc.email, otp });
    }

    const responseData: ResendOTPResponse = {
      success: true,
      message: 'OTP sent successfully',
    };
    return createSecureResponse(responseData, 200, request);
  } catch (error) {
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    logError('resend-otp API', error);
    return createSecureErrorResponse('Failed to resend OTP', 500, request);
  }
}
