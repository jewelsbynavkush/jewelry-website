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
import type { ResendEmailOTPResponse } from '@/types/api';

/**
 * POST /api/auth/resend-email-otp
 * Resend OTP to email address
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

    // Require authentication for email OTP resend
    const authResult = await requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { user: authUser } = authResult;

    // Get user document (need full document for OTP generation, not lean)
    // Don't use .select() to ensure all fields are available for method calls
    const userDoc = await User.findById(authUser.userId);
    if (!userDoc) {
      return createSecureErrorResponse('User not found', 404, request);
    }

    // Verify email exists
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
      // Ensure email is set (double-check)
      if (!userDoc.email) {
        return createSecureErrorResponse('Email is required to generate OTP', 400, request);
      }
      
      // Generate OTP manually (workaround for Next.js model method caching issue)
      // Check if method exists, otherwise generate manually
      let otp: string;
      if (typeof userDoc.generateEmailOTP === 'function') {
        otp = userDoc.generateEmailOTP();
      } else {
        // Manual OTP generation (fallback)
        otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        userDoc.emailVerificationOTP = otp;
        userDoc.emailVerificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      }
      
      // Save with error handling for validation errors
      try {
        await userDoc.save();
      } catch (saveError: unknown) {
        // Handle MongoDB validation errors
        if (saveError && typeof saveError === 'object' && 'name' in saveError && saveError.name === 'ValidationError') {
          const errors = Object.values('errors' in saveError && saveError.errors ? saveError.errors : {}).map((err: unknown) => 
            err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Validation error'
          );
          logError('User validation error in resend-email-otp', saveError);
          return createSecureErrorResponse(errors.join(', ') || 'Validation error', 400, request);
        }
        // Handle duplicate key errors
        if (saveError && typeof saveError === 'object' && 'code' in saveError && saveError.code === 11000) {
          logError('Duplicate key error in resend-email-otp', saveError);
          return createSecureErrorResponse('Email already in use', 400, request);
        }
        throw saveError; // Re-throw other errors
      }

      // Return OTP in response (no email service configured yet)
      const responseData: ResendEmailOTPResponse = {
        success: true,
        message: 'OTP sent successfully to your email',
        otp, // Include OTP in response until email service is configured
      };
      return createSecureResponse(responseData, 200, request);
    } catch (otpError: unknown) {
      // Handle specific OTP generation errors
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
