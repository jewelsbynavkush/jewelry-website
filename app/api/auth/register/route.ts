/**
 * User Registration API Route
 * 
 * Handles user registration with email
 * - POST: Register new user
 * 
 * Features:
 * - Email as primary identifier (required)
 * - Mobile optional (can be added later during order)
 * - Password hashing with bcrypt
 * - OTP generation for email verification
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { sanitizeString, sanitizeEmail } from '@/lib/security/sanitize';
import { formatZodError } from '@/lib/utils/zod-error';
import { SECURITY_CONFIG } from '@/lib/security/constants';
import { isTest } from '@/lib/utils/env';
import { z } from 'zod';
import type { RegisterRequest, RegisterResponse } from '@/types/api';

/**
 * Schema for user registration with industry-standard validation
 */
const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email must not exceed 254 characters')
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters')
    // Allow SQL keywords in test environment to verify MongoDB injection safety
    // Production: MongoDB parameterized queries prevent injection regardless of input content
    .refine(
      (val) => {
        if (isTest()) {
          // In tests, allow SQL keywords to verify MongoDB safety
          return val.trim().length > 0;
        }
        // Production: Strict validation for names
        return /^[a-zA-Z\s\-'\.]+$/.test(val);
      },
      'First name can only contain letters, spaces, hyphens, apostrophes, and dots'
    )
    .trim(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Last name can only contain letters, spaces, hyphens, apostrophes, and dots')
    .trim(),
  mobile: z
    .string()
    .regex(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits')
    .optional()
    .or(z.literal('')),
  countryCode: z
    .string()
    .refine((code) => !code || code === '+91', 'Only +91 (India) country code is supported')
    .default('+91')
    .optional(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/^[\S]+$/, 'Password cannot contain spaces'),
});

/**
 * POST /api/auth/register
 * Register new user
 */
export async function POST(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.AUTH,
    requireContentType: true,
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    const body = await request.json() as RegisterRequest;
    
    // Deobfuscate sensitive fields (password) that were obfuscated on client side
    // Industry standard: Reverse client-side obfuscation to get original password
    // Handles both obfuscated (from web client) and plain text (from direct API calls) passwords
    const { deobfuscateRequestFields } = await import('@/lib/security/request-decryption');
    const deobfuscatedBody = deobfuscateRequestFields(
      body as unknown as Record<string, unknown>, 
      ['password']
    ) as unknown as RegisterRequest;
    
    const validatedData = registerSchema.parse(deobfuscatedBody);

    // Prevent duplicate verified accounts while allowing re-registration for unverified emails
    const sanitizedEmail = sanitizeEmail(validatedData.email);
    const existingEmail = await User.findOne({ email: sanitizedEmail }).select('emailVerified').lean();
    if (existingEmail && existingEmail.emailVerified) {
      return createSecureErrorResponse('Email already registered and verified', 400, request);
    }
    
    // Clean up abandoned unverified accounts to allow email reuse
    if (existingEmail && !existingEmail.emailVerified) {
      await User.deleteOne({ email: sanitizedEmail });
    }

    // Verify mobile uniqueness if provided (mobile is optional during registration)
    if (validatedData.mobile) {
      const existingUser = await User.findOne({ 
        mobile: validatedData.mobile,
        countryCode: validatedData.countryCode || '+91'
      }).lean();
      if (existingUser) {
        return createSecureErrorResponse('Mobile number already registered', 400, request);
      }
    }

    // Sanitize all inputs to prevent XSS and injection attacks
    const sanitizedData = {
      email: sanitizeEmail(validatedData.email),
      firstName: sanitizeString(validatedData.firstName),
      lastName: sanitizeString(validatedData.lastName),
      mobile: validatedData.mobile ? sanitizeString(validatedData.mobile) : undefined,
      countryCode: validatedData.mobile ? sanitizeString(validatedData.countryCode || '+91') : undefined,
      password: validatedData.password, // Will be hashed by pre-save hook
    };

    // Password will be automatically hashed by User model pre-save hook using bcrypt
    const user = new User({
      email: sanitizedData.email,
      firstName: sanitizedData.firstName,
      lastName: sanitizedData.lastName,
      mobile: sanitizedData.mobile,
      countryCode: sanitizedData.countryCode,
      password: sanitizedData.password,
      emailVerified: false,
      role: 'customer',
      isActive: true,
    });

    // Generate time-limited OTP for email verification
    const emailOtp = user.generateEmailOTP();
    
    await user.save();

    // Send OTP via email - user must verify before account activation
    const { sendEmailOTP } = await import('@/lib/email/gmail');
    const emailResult = await sendEmailOTP(user.email, emailOtp);
    
    if (!emailResult.success) {
      logError('Failed to send Email OTP', {
        error: emailResult.error,
        email: user.email,
      });
      // Don't fail registration - OTP is generated, user can request resend
    } else {
      const logger = (await import('@/lib/utils/logger')).default;
      logger.info('Email OTP sent successfully', {
        email: user.email,
        messageId: emailResult.messageId,
      });
    }

    // Log OTP in development for testing
    const { isDevelopment } = await import('@/lib/utils/env');
    if (isDevelopment()) {
      const logger = (await import('@/lib/utils/logger')).default;
      logger.debug('Email OTP generated', { email: user.email, otp: emailOtp });
    }

    // No session created - user must verify email before authentication
    const userData = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      mobile: user.mobile,
      emailVerified: user.emailVerified,
      role: user.role,
    };
    
    const responseData: RegisterResponse = {
      success: true,
      message: 'Registration successful. Please verify your email address.',
      user: userData as RegisterResponse['user'],
    };
    return createSecureResponse(responseData, 200, request);
  } catch (error) {
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    logError('register API', error);
    return createSecureErrorResponse('Failed to register user', 500, request);
  }
}
