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

    const response = createSecureResponse(
      {
        user: {
          id: userDoc._id.toString(),
          mobile: userDoc.mobile,
          countryCode: userDoc.countryCode,
          email: userDoc.email,
          emailVerified: userDoc.emailVerified,
          firstName: userDoc.firstName,
          lastName: userDoc.lastName,
          displayName: userDoc.displayName,
          role: userDoc.role,
          preferences: userDoc.preferences,
          totalOrders: userDoc.totalOrders,
          totalSpent: userDoc.totalSpent,
          loyaltyPoints: userDoc.loyaltyPoints,
          createdAt: userDoc.createdAt,
        },
      },
      200,
      request
    );
    
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

    // Validate request body before processing to prevent invalid data updates
    // Zod schema ensures type safety and business rule compliance
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Optimize: Only select fields needed for update
    const userDoc = await User.findById(user.userId)
      .select('mobile email firstName lastName displayName emailVerified emailVerificationOTP emailVerificationOTPExpires');
    if (!userDoc) {
      return createSecureErrorResponse('User not found', 404, request);
    }

    // Update profile fields with sanitized input to prevent XSS
    // Only updates fields that are provided in request
    if (validatedData.firstName !== undefined) {
      userDoc.firstName = sanitizeString(validatedData.firstName);
    }

    if (validatedData.lastName !== undefined) {
      userDoc.lastName = sanitizeString(validatedData.lastName);
    }

    if (validatedData.displayName !== undefined) {
      userDoc.displayName = validatedData.displayName ? sanitizeString(validatedData.displayName) : undefined;
    }

    // Prevent email changes if already verified (security best practice)
    // Verified emails are trusted identifiers and should not be modified
    if (validatedData.email !== undefined && userDoc.emailVerified) {
      // Email is verified - prevent any changes
      if (validatedData.email === '') {
        // Cannot clear verified email
        return createSecureErrorResponse('Email cannot be cleared once verified', 400, request);
      }
      
      const sanitizedEmail = sanitizeEmail(validatedData.email);
      const currentEmail = userDoc.email?.toLowerCase().trim() || '';
      const newEmail = sanitizedEmail.toLowerCase().trim();
      
      // If trying to change verified email, reject
      if (currentEmail !== newEmail) {
        return createSecureErrorResponse('Email cannot be changed once verified', 400, request);
      }
      // If same email, allow (no-op, no change needed)
    } else if (validatedData.email !== undefined && !userDoc.emailVerified) {
      // Email is not verified - allow updates
      if (validatedData.email === '') {
        // Email is required, cannot be cleared
        return createSecureErrorResponse('Email is required and cannot be cleared', 400, request);
      } else {
        const sanitizedEmail = sanitizeEmail(validatedData.email);
        
        // Verify email uniqueness to prevent duplicate accounts
        // Excludes current user from check to allow keeping same email
        const existingUser = await User.findOne({ 
          email: sanitizedEmail,
          _id: { $ne: user.userId }
        }).select('_id emailVerified').lean();
        
        if (existingUser) {
          // Allow if existing user's email is not verified (can register again)
          if (existingUser.emailVerified) {
            return createSecureErrorResponse('Email already in use', 400, request);
          }
        }

        // If email changed, mark as unverified and generate OTP
        // Industry standard: Require email verification when email is changed
        const currentEmail = userDoc.email?.toLowerCase().trim() || '';
        const newEmail = sanitizedEmail.toLowerCase().trim();
        const emailChanged = currentEmail !== newEmail;
        
        if (emailChanged) {
          userDoc.email = sanitizedEmail;
          userDoc.emailVerified = false;
          
          // Generate new OTP for email verification after email change
          // Invalidates previous OTP and requires re-verification
          // Email is set above, so generateEmailOTP() should work
          try {
            const emailOtp = userDoc.generateEmailOTP();
            
            // Send OTP email via Gmail SMTP for new email verification
            // User must verify new email before it becomes active
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
            
            // Log OTP in development for testing
            const { isDevelopment } = await import('@/lib/utils/env');
            if (isDevelopment()) {
              const logger = (await import('@/lib/utils/logger')).default;
              logger.debug('Email OTP generated', { email: sanitizedEmail, otp: emailOtp });
            }
          } catch (error) {
            // If OTP generation fails, log but don't fail the update
            logError('Failed to generate email OTP', error);
            // Still mark as unverified so user can request OTP later
          }
        }
      }
    }

    // Update mobile number and country code if provided
    if (validatedData.mobile !== undefined) {
      if (validatedData.mobile === '') {
        // Allow clearing mobile
        userDoc.mobile = undefined;
        userDoc.countryCode = undefined;
      } else {
        // Validate mobile format
        if (!/^[0-9]{10}$/.test(validatedData.mobile)) {
          return createSecureErrorResponse('Mobile number must be 10 digits', 400, request);
        }

        // Verify mobile uniqueness if provided
        const countryCode = validatedData.countryCode || '+91';
        const existingUser = await User.findOne({ 
          mobile: validatedData.mobile,
          countryCode: countryCode,
          _id: { $ne: user.userId }
        }).select('_id').lean();
        
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
      // Handle MongoDB validation errors
      if (saveError && typeof saveError === 'object' && 'name' in saveError && saveError.name === 'ValidationError') {
        const errors = Object.values('errors' in saveError && saveError.errors ? saveError.errors : {}).map((err: unknown) => 
          err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Validation error'
        );
        return createSecureErrorResponse(errors.join(', ') || 'Validation error', 400, request);
      }
      
      // Handle MongoDB duplicate key errors (unique constraint violations)
      // Provides user-friendly error messages for duplicate email or other unique field conflicts
      if (saveError && typeof saveError === 'object' && 'code' in saveError && saveError.code === 11000) {
        const keyPattern = 'keyPattern' in saveError && saveError.keyPattern ? saveError.keyPattern : {};
        const field = Object.keys(keyPattern)[0];
        if (field === 'email') {
          return createSecureErrorResponse('Email already in use', 400, request);
        }
        return createSecureErrorResponse(`${field} already exists`, 400, request);
      }
      
      // Re-throw other errors to be caught by outer catch
      throw saveError;
    }

    return createSecureResponse(
      {
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: userDoc._id.toString(),
          mobile: userDoc.mobile,
          countryCode: userDoc.countryCode,
          email: userDoc.email,
          emailVerified: userDoc.emailVerified,
          firstName: userDoc.firstName,
          lastName: userDoc.lastName,
          displayName: userDoc.displayName,
        },
      },
      200,
      request
    );
  } catch (error) {
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    logError('user profile PATCH API', error);
    return createSecureErrorResponse('Failed to update profile', 500, request);
  }
}
