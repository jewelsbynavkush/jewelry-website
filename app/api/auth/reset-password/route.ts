/**
 * Password Reset Request API Route
 * 
 * Handles password reset request:
 * - POST: Request password reset (sends reset token)
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { sanitizeEmail } from '@/lib/security/sanitize';
import { formatZodError } from '@/lib/utils/zod-error';
import { SECURITY_CONFIG, TIME_DURATIONS_MS } from '@/lib/security/constants';
import { z } from 'zod';
import crypto from 'crypto';
import type { ResetPasswordRequest, ResetPasswordResponse } from '@/types/api';

/**
 * Schema for password reset request with industry-standard validation
 */
const resetPasswordRequestSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email must not exceed 254 characters')
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
});

/**
 * POST /api/auth/reset-password
 * Request password reset
 */
export async function POST(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.AUTH_RESET_REQUEST,
    requireContentType: true,
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    // Validate request body to ensure email format is correct before processing
    const body = await request.json() as ResetPasswordRequest;
    const validatedData = resetPasswordRequestSchema.parse(body);

    // Sanitize and validate email
    const email = sanitizeEmail(validatedData.identifier);

    // Lookup user by email (primary identifier for password reset)
    const user = await User.findOne({ email })
      .select('mobile countryCode email resetPasswordToken resetPasswordExpires');

    // Always return success (prevent user enumeration)
    if (!user) {
      const responseData: ResetPasswordResponse = {
        success: true,
        message: 'If the account exists, a password reset link has been sent.',
      };
      return createSecureResponse(responseData, 200, request);
    }

    // Generate cryptographically secure reset token for password reset link
    // Token expires after 1 hour for security
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + TIME_DURATIONS_MS.ONE_HOUR);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // TODO: Send password reset email
    // For now, log token in development
    const { isDevelopment } = await import('@/lib/utils/env');
    if (isDevelopment()) {
      const logger = (await import('@/lib/utils/logger')).default;
      logger.debug('Password reset token generated', { 
        email: user.email,
        token: resetToken 
      });
    }

    const responseData: ResetPasswordResponse = {
      success: true,
      message: 'If the account exists, a password reset link has been sent.',
    };
    return createSecureResponse(
      {
        ...responseData,
        // Include token in development only
        ...(isDevelopment() && { resetToken }),
      },
      200,
      request
    );
  } catch (error) {
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    logError('reset-password API', error);
    return createSecureErrorResponse('Failed to process password reset request', 500, request);
  }
}
