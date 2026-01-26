/**
 * Resend Email OTP API Route
 * 
 * Handles email OTP resend:
 * - POST: Resend OTP to email address
 * - Requires authentication
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth/middleware';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { formatZodError } from '@/lib/utils/zod-error';
import { SECURITY_CONFIG } from '@/lib/security/constants';
import type { ResendEmailOTPResponse } from '@/types/api';

/**
 * POST /api/auth/resend-email-otp
 * Resend OTP to email address
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

    // Require authentication for email OTP resend
    const authResult = await requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { user: authUser } = authResult;

    // Fetch user document with OTP-related fields for email verification
    // Select only required fields to optimize query performance
    const userDoc = await User.findById(authUser.userId)
      .select('email emailVerified emailVerificationOTP emailVerificationOTPExpires');
    if (!userDoc) {
      return createSecureErrorResponse('User not found', 404, request);
    }

    // Verify user has email address (required for OTP generation)
    if (!userDoc.email) {
      return createSecureErrorResponse('No email address associated with this account', 400, request);
    }

    // Security: Only allow resend for unverified emails
    // Prevents unnecessary OTP generation for already-verified accounts
    if (userDoc.emailVerified) {
      return createSecureErrorResponse('Email is already verified', 400, request);
    }

    // Generate new OTP (invalidates previous OTP)
    try {
      // Double-check email exists before OTP generation (defensive programming)
      // Prevents runtime errors if email was somehow cleared between checks
      if (!userDoc.email) {
        return createSecureErrorResponse('Email is required to generate OTP', 400, request);
      }
      
      // Generate OTP using model method if available, otherwise use manual fallback
      // Fallback handles cases where model methods may not be available due to Next.js caching
      let otp: string;
      if (typeof userDoc.generateEmailOTP === 'function') {
        otp = userDoc.generateEmailOTP();
      } else {
        // Manual OTP generation fallback: Generate 6-digit random number
        otp = Math.floor(100000 + Math.random() * 900000).toString();
        userDoc.emailVerificationOTP = otp;
        userDoc.emailVerificationOTPExpires = new Date(Date.now() + SECURITY_CONFIG.OTP_EXPIRATION_MS);
      }
      
      // Save with error handling for validation errors
      try {
        await userDoc.save();
      } catch (saveError: unknown) {
        // Handle MongoDB schema validation errors during OTP save
        // Provides user-friendly error messages for validation failures
        if (saveError && typeof saveError === 'object' && 'name' in saveError && saveError.name === 'ValidationError') {
          const errors = Object.values('errors' in saveError && saveError.errors ? saveError.errors : {}).map((err: unknown) => 
            err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Validation error'
          );
          logError('User validation error in resend-email-otp', saveError);
          return createSecureErrorResponse(errors.join(', ') || 'Validation error', 400, request);
        }
        // Handle MongoDB duplicate key errors (unique constraint violations)
        // Prevents duplicate email addresses or other unique field conflicts
        if (saveError && typeof saveError === 'object' && 'code' in saveError && saveError.code === 11000) {
          logError('Duplicate key error in resend-email-otp', saveError);
          return createSecureErrorResponse('Email already in use', 400, request);
        }
        throw saveError; // Re-throw other errors
      }

      // Send OTP email via Gmail SMTP for email verification
      // OTP is time-limited (15 minutes) for security
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

      const responseData: ResendEmailOTPResponse = {
        success: true,
        message: 'OTP sent successfully to your email',
      };
      return createSecureResponse(responseData, 200, request);
    } catch (otpError: unknown) {
      // Handle OTP generation errors with specific error messages
      // Provides user-friendly feedback for different failure scenarios
      const errorMessage = otpError instanceof Error ? otpError.message : String(otpError);
      if (errorMessage.includes('Email is required')) {
        return createSecureErrorResponse('Email is required to generate OTP', 400, request);
      }
      logError('Failed to generate email OTP in resend-email-otp', otpError);
      return createSecureErrorResponse(`Failed to generate email OTP: ${errorMessage || 'Unknown error'}`, 500, request);
    }
  } catch (error: unknown) {
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    // Log detailed error for debugging
    logError('resend-email-otp API', error);
    
    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage) {
      return createSecureErrorResponse(`Failed to resend email OTP: ${errorMessage}`, 500, request);
    }
    
    return createSecureErrorResponse('Failed to resend email OTP', 500, request);
  }
}
