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
import { z } from 'zod';

/**
 * Schema for updating profile
 */
const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50).optional(),
  lastName: z.string().min(1, 'Last name is required').max(50).optional(),
  email: z.string().email('Invalid email').max(254).optional().or(z.literal('')),
  displayName: z.string().max(100).optional(),
});

/**
 * GET /api/users/profile
 * Get user profile
 */
export async function GET(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  // Industry standard: 100 requests per 15 minutes for user-specific endpoints
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes (industry standard)
  });
  if (securityResponse) return securityResponse;

  try {
    const authResult = await requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { user } = authResult;

    await connectDB();

    // Optimize: Only select fields needed for profile response
    const userDoc = await User.findById(user.userId)
      .select('mobile email firstName lastName role mobileVerified emailVerified')
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
          mobileVerified: userDoc.mobileVerified,
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
  // Apply security (CORS, CSRF, rate limiting)
  // Industry standard: 50 write operations per 15 minutes for profile updates
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 50 }, // 50 requests per 15 minutes (industry standard)
    requireContentType: true,
  });
  if (securityResponse) return securityResponse;

  try {
    const authResult = await requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { user } = authResult;

    await connectDB();

    // Parse and validate request body - ensures profile data is valid before updating
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

    if (validatedData.email !== undefined && validatedData.email !== '') {
      const sanitizedEmail = sanitizeEmail(validatedData.email);
      
      // Verify email uniqueness to prevent duplicate accounts
      // Excludes current user from check to allow keeping same email
      const existingUser = await User.findOne({ 
        email: sanitizedEmail,
        _id: { $ne: user.userId }
      }).select('_id').lean();
      
      if (existingUser) {
        return createSecureErrorResponse('Email already in use', 400, request);
      }

      // If email changed, mark as unverified and generate OTP
      // Industry standard: Require email verification when email is changed
      const currentEmail = userDoc.email?.toLowerCase().trim() || '';
      const newEmail = sanitizedEmail.toLowerCase().trim();
      const emailChanged = currentEmail !== newEmail;
      
      if (emailChanged) {
        userDoc.email = sanitizedEmail;
        userDoc.emailVerified = false;
        
        // Generate email OTP for verification
        // Email is set above, so generateEmailOTP() should work
        try {
          const emailOtp = userDoc.generateEmailOTP();
          
          // TODO: Send OTP via email service (SendGrid/Resend)
          // For now, log OTP in development
          if (process.env.NODE_ENV === 'development') {
            console.log(`[DEV] Email OTP for ${sanitizedEmail}: ${emailOtp}`);
          }
        } catch (error) {
          // If OTP generation fails, log but don't fail the update
          logError('Failed to generate email OTP', error);
          // Still mark as unverified so user can request OTP later
        }
      }
    } else if (validatedData.email === '') {
      // Allow clearing email
      userDoc.email = undefined;
      userDoc.emailVerified = false;
      userDoc.emailVerificationOTP = undefined;
      userDoc.emailVerificationOTPExpires = undefined;
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
      
      // Handle duplicate key errors (e.g., email already exists)
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
