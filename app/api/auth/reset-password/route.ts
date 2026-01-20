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
import { sanitizeString, sanitizeEmail } from '@/lib/security/sanitize';
import { formatZodError } from '@/lib/utils/zod-error';
import { z } from 'zod';
import crypto from 'crypto';
import type { ResetPasswordRequest, ResetPasswordResponse } from '@/types/api';

/**
 * Schema for password reset request
 */
const resetPasswordRequestSchema = z.object({
  identifier: z.string().min(1, 'Mobile number or email is required'),
});

/**
 * POST /api/auth/reset-password
 * Request password reset
 */
export async function POST(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 10 reset requests per hour
    requireContentType: true,
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    // Parse and validate request body
    const body = await request.json() as ResetPasswordRequest;
    const validatedData = resetPasswordRequestSchema.parse(body);

    // Determine if identifier is mobile or email
    const isEmail = validatedData.identifier.includes('@');
    const identifier = isEmail ? sanitizeEmail(validatedData.identifier) : sanitizeString(validatedData.identifier);

    // Find user - Optimize: Only select fields needed
    const user = await User.findOne(
      isEmail ? { email: identifier } : { mobile: identifier }
    ).select('mobile email resetPasswordToken resetPasswordExpires');

    // Always return success (prevent user enumeration)
    if (!user) {
      const responseData: ResetPasswordResponse = {
        success: true,
        message: 'If the account exists, a password reset link has been sent.',
      };
      return createSecureResponse(responseData, 200, request);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // TODO: Send password reset email/SMS
    // For now, log token in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Password reset token for ${user.mobile}: ${resetToken}`);
    }

    const responseData: ResetPasswordResponse = {
      success: true,
      message: 'If the account exists, a password reset link has been sent.',
    };
    return createSecureResponse(
      {
        ...responseData,
        // Include token in development only
        ...(process.env.NODE_ENV === 'development' && { resetToken }),
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
