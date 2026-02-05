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
import { SECURITY_CONFIG } from '@/lib/security/constants';
import type { ConfirmResetPasswordRequest, ConfirmResetPasswordResponse } from '@/types/api';
import { z } from 'zod';

/**
 * Schema for password reset confirmation with industry-standard validation
 */
const resetPasswordConfirmSchema = z.object({
  token: z
    .string()
    .min(1, 'Reset token is required')
    .max(200, 'Reset token is too long'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/^[\S]+$/, 'Password cannot contain spaces'),
});

/**
 * POST /api/auth/reset-password/confirm
 * Confirm password reset
 */
export async function POST(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.AUTH_RESET,
    requireContentType: true,
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    // Validate reset token and new password format before processing
    // Ensures token is valid format and password meets security requirements
    const body = await request.json() as ConfirmResetPasswordRequest;
    
    // Deobfuscate sensitive fields (password, token) that were obfuscated on client side
    // Industry standard: Reverse client-side obfuscation to get original values
    // Handles both obfuscated (from web client) and plain text (from direct API calls) values
    const { deobfuscateRequestFields } = await import('@/lib/security/request-decryption');
    const deobfuscatedBody = deobfuscateRequestFields(
      body as unknown as Record<string, unknown>, 
      ['password', 'token']
    ) as unknown as ConfirmResetPasswordRequest;
    
    const validatedData = resetPasswordConfirmSchema.parse(deobfuscatedBody);

    // Lookup user by reset token with expiration check
    // Only select required fields to minimize data transfer
    // Note: Cannot use .lean() here as we need to call .save() on the document
    const user = await User.findOne({
      resetPasswordToken: sanitizeString(validatedData.token),
      resetPasswordExpires: { $gt: new Date() }, // Token not expired
    }).select('_id password resetPasswordToken resetPasswordExpires passwordChangedAt');

    if (!user) {
      return createSecureErrorResponse('Invalid or expired reset token', 400, request);
    }

    // Update password - pre-save hook automatically hashes with bcrypt
    // Password change timestamp tracked for security auditing and compliance
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
