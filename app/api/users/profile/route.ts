/**
 * User Profile API Route
 * 
 * Handles user profile operations:
 * - GET: Get user profile
 * - PATCH: Update user profile
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth/middleware';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { sanitizeString, sanitizeEmail } from '@/lib/security/sanitize';
import { formatZodError } from '@/lib/utils/zod-error';
import { SECURITY_CONFIG } from '@/lib/security/constants';
import type { GetProfileResponse, UpdateProfileRequest, UpdateProfileResponse } from '@/types/api';
import { z } from 'zod';

/**
 * Schema for updating profile with industry-standard validation
 */
const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'First name can only contain letters, spaces, hyphens, apostrophes, and dots')
    .trim()
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Last name can only contain letters, spaces, hyphens, apostrophes, and dots')
    .trim()
    .optional(),
  email: z
    .string()
    .max(254, 'Email must not exceed 254 characters')
    .email('Invalid email format')
    .toLowerCase()
    .trim()
    .optional()
    .or(z.literal('')),
  displayName: z
    .string()
    .max(100, 'Display name must not exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s\-'\.]+$/, 'Display name can only contain letters, numbers, spaces, hyphens, apostrophes, and dots')
    .trim()
    .optional(),
  mobile: z
    .string()
    .regex(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits')
    .optional()
    .or(z.literal('')),
  countryCode: z
    .string()
    .refine((code) => !code || code === '+91', 'Only +91 (India) country code is supported')
    .optional(),
});

/**
 * GET /api/users/profile
 * Get user profile
 */
export async function GET(request: NextRequest) {
  // Apply security (CORS, CSRF) - rate limiting done after auth with user ID
  const securityResponse = applyApiSecurity(request, {
    enableRateLimit: false, // Disable IP-based rate limiting, use user-based instead
  });
  if (securityResponse) return securityResponse;

  try {
    const authResult = await requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { user } = authResult;

    // Industry standard: Per-user rate limiting for authenticated endpoints
    const { checkUserRateLimit } = await import('@/lib/security/api-security');
    const userRateLimitResponse = checkUserRateLimit(
      request,
      user.userId,
      SECURITY_CONFIG.RATE_LIMIT.USER_PROFILE_READ
    );
    if (userRateLimitResponse) return userRateLimitResponse;

    await connectDB();

    // Optimize: Only select fields needed for profile response
    const userDoc = await User.findById(user.userId)
      .select('mobile countryCode email firstName lastName displayName role emailVerified preferences totalOrders totalSpent loyaltyPoints createdAt')
      .lean();
    if (!userDoc) {
      return createSecureErrorResponse('User not found', 404, request);
    }

    const payload: GetProfileResponse = {
      user: {
        id: userDoc._id.toString(),
        email: userDoc.email ?? '',
        firstName: userDoc.firstName ?? '',
        lastName: userDoc.lastName ?? '',
        role: userDoc.role,
        emailVerified: userDoc.emailVerified ?? false,
        mobile: userDoc.mobile,
        countryCode: userDoc.countryCode,
        displayName: userDoc.displayName,
        preferences: userDoc.preferences,
        totalOrders: userDoc.totalOrders,
        totalSpent: userDoc.totalSpent,
        loyaltyPoints: userDoc.loyaltyPoints,
        createdAt: userDoc.createdAt?.toISOString(),
      },
    };
    const response = createSecureResponse(payload, 200, request);
    
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return response;
  } catch (error) {
    logError('user profile GET API', error);
    return createSecureErrorResponse('Failed to retrieve profile', 500, request);
  }
}

/**
 * PATCH /api/users/profile
 * Update user profile
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

    // Industry standard: Per-user rate limiting for authenticated endpoints
    const { checkUserRateLimit } = await import('@/lib/security/api-security');
    const userRateLimitResponse = checkUserRateLimit(
      request,
      user.userId,
      SECURITY_CONFIG.RATE_LIMIT.USER_PROFILE_WRITE
    );
    if (userRateLimitResponse) return userRateLimitResponse;

    await connectDB();

    const body = (await request.json()) as UpdateProfileRequest;
    const validatedData = updateProfileSchema.parse(body);

    // Optimize: Only select fields needed for update
    const userDoc = await User.findById(user.userId)
      .select('mobile email firstName lastName displayName emailVerified emailVerificationOTP emailVerificationOTPExpires');
    if (!userDoc) {
      return createSecureErrorResponse('User not found', 404, request);
    }

    // Update only provided fields with sanitized input to prevent XSS
    if (validatedData.firstName !== undefined) {
      userDoc.firstName = sanitizeString(validatedData.firstName);
    }

    if (validatedData.lastName !== undefined) {
      userDoc.lastName = sanitizeString(validatedData.lastName);
    }

    if (validatedData.displayName !== undefined) {
      userDoc.displayName = validatedData.displayName ? sanitizeString(validatedData.displayName) : undefined;
    }

    // Prevent changes to verified emails (trusted identifiers)
    if (validatedData.email !== undefined && userDoc.emailVerified) {
      if (validatedData.email === '') {
        return createSecureErrorResponse('Email cannot be cleared once verified', 400, request);
      }
      
      const sanitizedEmail = sanitizeEmail(validatedData.email);
      const currentEmail = userDoc.email?.toLowerCase().trim() || '';
      const newEmail = sanitizedEmail.toLowerCase().trim();
      
      // Reject any changes to verified email
      if (currentEmail !== newEmail) {
        return createSecureErrorResponse('Email cannot be changed once verified', 400, request);
      }
    } else if (validatedData.email !== undefined && !userDoc.emailVerified) {
      // Allow email updates for unverified accounts
      if (validatedData.email === '') {
        return createSecureErrorResponse('Email is required and cannot be cleared', 400, request);
      } else {
        const sanitizedEmail = sanitizeEmail(validatedData.email);
        
        // Check email uniqueness (exclude current user)
        const existingUser = await User.findOne({ 
          email: sanitizedEmail,
          _id: { $ne: user.userId }
        }).select('_id emailVerified').lean();
        
        if (existingUser && existingUser.emailVerified) {
          return createSecureErrorResponse('Email already in use', 400, request);
        }

        // Require re-verification if email changed
        const currentEmail = userDoc.email?.toLowerCase().trim() || '';
        const newEmail = sanitizedEmail.toLowerCase().trim();
        const emailChanged = currentEmail !== newEmail;
        
        if (emailChanged) {
          userDoc.email = sanitizedEmail;
          userDoc.emailVerified = false;
          
          // Generate new OTP for changed email
          try {
            const emailOtp = userDoc.generateEmailOTP();
            
            // Send verification OTP to new email address
            const { sendEmailOTP } = await import('@/lib/email/gmail');
            const emailResult = await sendEmailOTP(sanitizedEmail, emailOtp);
            
            if (!emailResult.success) {
              logError('Failed to send Email OTP', {
                error: emailResult.error,
                email: sanitizedEmail,
              });
            } else {
              const logger = (await import('@/lib/utils/logger')).default;
              logger.info('Email OTP sent successfully', {
                email: sanitizedEmail,
                messageId: emailResult.messageId,
              });
            }
            
            // Log OTP in development for testing convenience
            const { isDevelopment } = await import('@/lib/utils/env');
            if (isDevelopment()) {
              const logger = (await import('@/lib/utils/logger')).default;
              logger.debug('Email OTP generated', { email: sanitizedEmail, otp: emailOtp });
            }
          } catch (error) {
            // Log error but don't fail update - user can request OTP later
            logError('Failed to generate email OTP', error);
          }
        }
      }
    }

    // Update mobile if provided (optional field)
    if (validatedData.mobile !== undefined) {
      if (validatedData.mobile === '') {
        // Allow clearing mobile number
        userDoc.mobile = undefined;
        userDoc.countryCode = undefined;
      } else {
        // Validate 10-digit format
        if (!/^[0-9]{10}$/.test(validatedData.mobile)) {
          return createSecureErrorResponse('Mobile number must be 10 digits', 400, request);
        }

        // Check mobile uniqueness (exclude current user)
        const countryCode = validatedData.countryCode || '+91';
        const existingUser = await User.findOne({ 
          mobile: validatedData.mobile,
          countryCode: countryCode,
          _id: { $ne: user.userId }
        })
          .select('_id')
          .lean();
        
        if (existingUser) {
          return createSecureErrorResponse('Mobile number already in use', 400, request);
        }

        userDoc.mobile = sanitizeString(validatedData.mobile);
        userDoc.countryCode = sanitizeString(countryCode);
      }
    }

    try {
      await userDoc.save();
    } catch (saveError: unknown) {
      // Handle Mongoose errors with reusable utility
      const { handleMongooseSaveError } = await import('@/lib/utils/mongoose-error-handler');
      const errorResponse = handleMongooseSaveError(saveError, request, 'user profile update');
      if (errorResponse) {
        return errorResponse;
      }
      
      // Re-throw other errors for outer catch block
      throw saveError;
    }

    const payload: UpdateProfileResponse = {
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: userDoc._id.toString(),
        email: userDoc.email ?? '',
        firstName: userDoc.firstName ?? '',
        lastName: userDoc.lastName ?? '',
        role: userDoc.role,
        emailVerified: userDoc.emailVerified ?? false,
        mobile: userDoc.mobile,
        countryCode: userDoc.countryCode,
        displayName: userDoc.displayName,
      },
    };
    return createSecureResponse(payload, 200, request);
  } catch (error) {
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    logError('user profile PATCH API', error);
    return createSecureErrorResponse('Failed to update profile', 500, request);
  }
}
