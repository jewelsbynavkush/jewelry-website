/**
 * Password Reset Confirmation API Route
 * 
 * Handles password reset confirmation:
 * - POST: Confirm password reset with token
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import RefreshToken from '@/models/RefreshToken';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { sanitizeString } from '@/lib/security/sanitize';
import { formatZodError } from '@/lib/utils/zod-error';
import type { ConfirmResetPasswordRequest, ConfirmResetPasswordResponse } from '@/types/api';
import { z } from 'zod';

/**
 * Schema for password reset confirmation
 */
const resetPasswordConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password too long'),
});

/**
 * POST /api/auth/reset-password/confirm
 * Confirm password reset
 */
export async function POST(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 10 attempts per 15 minutes
    requireContentType: true,
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    // Parse and validate request body - ensures reset token and new password are provided
    const body = await request.json() as ConfirmResetPasswordRequest;
    const validatedData = resetPasswordConfirmSchema.parse(body);

    // Find user by reset token - Optimize: Only select fields needed
    const user = await User.findOne({
      resetPasswordToken: sanitizeString(validatedData.token),
      resetPasswordExpires: { $gt: new Date() }, // Token not expired
    }).select('password resetPasswordToken resetPasswordExpires passwordChangedAt');

    if (!user) {
      return createSecureErrorResponse('Invalid or expired reset token', 400, request);
    }

    // Update password - pre-save hook will automatically hash it
    // Password change timestamp is tracked for security auditing
    user.password = validatedData.password; // Will be hashed by pre-save hook
    user.passwordChangedAt = new Date();
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Industry standard: Revoke all refresh tokens on password reset
    // Prevents use of old tokens after password reset (security best practice)
    try {
      await RefreshToken.revokeUserTokens(user._id.toString());
    } catch (error) {
      // Log but don't fail password reset if revocation fails
      logError('Failed to revoke refresh tokens on password reset', error);
    }

    const responseData: ConfirmResetPasswordResponse = {
      success: true,
      message: 'Password reset successfully. Please login with your new password.',
    };
    return createSecureResponse(responseData, 200, request);
  } catch (error) {
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    logError('reset-password-confirm API', error);
    return createSecureErrorResponse('Failed to reset password', 500, request);
  }
}
