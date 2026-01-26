/**
 * User Password Change API Route
 * 
 * Handles password change:
 * - PATCH: Change user password
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import RefreshToken from '@/models/RefreshToken';
import { requireAuth } from '@/lib/auth/middleware';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { formatZodError } from '@/lib/utils/zod-error';
import { SECURITY_CONFIG } from '@/lib/security/constants';
import { z } from 'zod';
import type { ChangePasswordRequest, ChangePasswordResponse } from '@/types/api';

/**
 * Schema for changing password with industry-standard validation
 */
const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required')
    .max(100, 'Password must not exceed 100 characters'),
  newPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/^[\S]+$/, 'Password cannot contain spaces'),
});

/**
 * PATCH /api/users/password
 * Change user password
 */
export async function PATCH(request: NextRequest) {
  // Apply security (CORS, CSRF) - rate limiting done after auth with user ID
  const securityResponse = applyApiSecurity(request, {
    enableRateLimit: false, // Disable IP-based rate limiting, use user-based instead
    requireContentType: true,
  });
  if (securityResponse) return securityResponse;

  try {
    const authResult = await requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { user } = authResult;

    // Industry standard: Per-user rate limiting for sensitive operations
    const { checkUserRateLimit } = await import('@/lib/security/api-security');
    const userRateLimitResponse = checkUserRateLimit(
      request,
      user.userId,
      SECURITY_CONFIG.RATE_LIMIT.PASSWORD_CHANGE
    );
    if (userRateLimitResponse) return userRateLimitResponse;

    await connectDB();

    const body = await request.json() as ChangePasswordRequest;
    const validatedData = changePasswordSchema.parse(body);

    // Fetch user with password field explicitly selected for verification
    // Password is excluded by default for security, but needed here to verify current password
    const userDoc = await User.findById(user.userId).select('+password');
    if (!userDoc) {
      return createSecureErrorResponse('User not found', 404, request);
    }

    // Verify current password before allowing change
    // Prevents unauthorized password changes if session is compromised
    const isCurrentPasswordValid = await userDoc.comparePassword(validatedData.currentPassword);
    if (!isCurrentPasswordValid) {
      return createSecureErrorResponse('Current password is incorrect', 400, request);
    }

    // Prevent reusing current password
    // Security best practice: new password must be different
    const isSamePassword = await userDoc.comparePassword(validatedData.newPassword);
    if (isSamePassword) {
      return createSecureErrorResponse('New password must be different from current password', 400, request);
    }

    // Update password - pre-save hook automatically hashes it with bcrypt
    // Password change timestamp tracked for security auditing and compliance
    userDoc.password = validatedData.newPassword;
    userDoc.passwordChangedAt = new Date();
    await userDoc.save();

    // Industry standard: Revoke all refresh tokens on password change
    // Prevents use of old tokens after password change (security best practice)
    try {
      await RefreshToken.revokeUserTokens(user.userId);
    } catch (error) {
      // Log but don't fail password change if revocation fails
      logError('Failed to revoke refresh tokens on password change', error);
    }

    const responseData: ChangePasswordResponse = {
      success: true,
      message: 'Password changed successfully. Please login again.',
    };
    return createSecureResponse(responseData, 200, request);
  } catch (error) {
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    logError('change password API', error);
    return createSecureErrorResponse('Failed to change password', 500, request);
  }
}
