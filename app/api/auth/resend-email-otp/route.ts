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
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.AUTH_RESEND_OTP,
    requireContentType: true,
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    const authResult = await requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { user: authUser } = authResult;

    // Load as document (not .lean()) so we can persist OTP; select only OTP-related fields
    const userDoc = await User.findById(authUser.userId)
      .select('_id email emailVerified emailVerificationOTP emailVerificationOTPExpires');
    if (!userDoc) {
      return createSecureErrorResponse('User not found', 404, request);
    }

    if (!userDoc.email) {
      return createSecureErrorResponse('No email address associated with this account', 400, request);
    }

    // Only allow resend for unverified emails (avoids unnecessary OTP and enforces verification flow)
    if (userDoc.emailVerified) {
      return createSecureErrorResponse('Email is already verified', 400, request);
    }

    try {
      if (!userDoc.email) {
        return createSecureErrorResponse('Email is required to generate OTP', 400, request);
      }

      // Prefer model method; fallback to 6-digit random when model methods unavailable (e.g. Next.js module caching)
      let otp: string;
      if (typeof userDoc.generateEmailOTP === 'function') {
        otp = userDoc.generateEmailOTP();
      } else {
        otp = Math.floor(100000 + Math.random() * 900000).toString();
        userDoc.emailVerificationOTP = otp;
        userDoc.emailVerificationOTPExpires = new Date(Date.now() + SECURITY_CONFIG.OTP_EXPIRATION_MS);
      }

      try {
        await userDoc.save();
      } catch (saveError: unknown) {
        const { handleMongooseSaveError } = await import('@/lib/utils/mongoose-error-handler');
        const errorResponse = handleMongooseSaveError(saveError, request, 'resend-email-otp');
        if (errorResponse) return errorResponse;
        throw saveError;
      }

      // OTP is time-limited (15 min); send via Gmail SMTP
      const { sendEmailOTP } = await import('@/lib/email/gmail');
      const emailResult = await sendEmailOTP(userDoc.email, otp);
      
      if (!emailResult.success) {
        logError('Failed to send Email OTP', {
          error: emailResult.error,
          email: userDoc.email,
        });
        // Do not fail request: OTP is already stored; user can request resend
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
      const errorMessage = otpError instanceof Error ? otpError.message : String(otpError);
      if (errorMessage.includes('Email is required')) {
        return createSecureErrorResponse('Email is required to generate OTP', 400, request);
      }
      logError('Failed to generate email OTP in resend-email-otp', otpError);
      return createSecureErrorResponse('Failed to generate email OTP', 500, request);
    }
  } catch (error: unknown) {
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    logError('resend-email-otp API', error);
    return createSecureErrorResponse('Failed to resend email OTP', 500, request);
  }
}
