/**
 * User Registration API Route
 * 
 * Handles user registration with mobile number
 * - POST: Register new user
 * 
 * Features:
 * - Mobile number as primary identifier (required)
 * - Email optional
 * - Password hashing with bcrypt
 * - OTP generation for mobile verification
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { sanitizeString, sanitizeEmail } from '@/lib/security/sanitize';
import { formatZodError } from '@/lib/utils/zod-error';
import { z } from 'zod';
import type { RegisterRequest, RegisterResponse } from '@/types/api';

/**
 * Schema for user registration
 */
const registerSchema = z.object({
  mobile: z.string().regex(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
  countryCode: z.string().default('+91'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email').max(254).optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password too long'),
});

/**
 * POST /api/auth/register
 * Register new user
 */
export async function POST(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  // Industry standard: 10 registrations per 15 minutes (same for all environments)
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { 
      windowMs: 15 * 60 * 1000, 
      maxRequests: 50 // 50 registrations per 15 minutes
    },
    requireContentType: true,
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    // Parse and validate request body - ensures all required fields are present and valid
    const body = await request.json() as RegisterRequest;
    const validatedData = registerSchema.parse(body);

    // Verify mobile number is unique to prevent duplicate accounts
    // Mobile number is used as primary identifier for authentication
    const existingUser = await User.findOne({ mobile: validatedData.mobile }).lean();
    if (existingUser) {
      return createSecureErrorResponse('Mobile number already registered', 400, request);
    }

    // Verify email uniqueness if provided (email is optional)
    // Prevents multiple accounts with same email address
    if (validatedData.email) {
      const sanitizedEmail = sanitizeEmail(validatedData.email);
      const existingEmail = await User.findOne({ email: sanitizedEmail }).lean();
      if (existingEmail) {
        return createSecureErrorResponse('Email already registered', 400, request);
      }
    }

    // Sanitize inputs
    const sanitizedData = {
      mobile: validatedData.mobile,
      countryCode: sanitizeString(validatedData.countryCode || '+91'),
      firstName: sanitizeString(validatedData.firstName),
      lastName: sanitizeString(validatedData.lastName),
      email: validatedData.email ? sanitizeEmail(validatedData.email) : undefined,
      password: validatedData.password, // Will be hashed by pre-save hook
    };

    // Create new user account with hashed password
    // Password will be automatically hashed by pre-save hook
    const user = new User({
      mobile: sanitizedData.mobile,
      countryCode: sanitizedData.countryCode,
      firstName: sanitizedData.firstName,
      lastName: sanitizedData.lastName,
      email: sanitizedData.email,
      password: sanitizedData.password,
      mobileVerified: false,
      emailVerified: false,
      role: 'customer',
      isActive: true,
    });

    // Generate OTP for mobile verification
    const mobileOtp = user.generateMobileOTP();
    
    // Generate OTP for email verification if email provided
    let emailOtp: string | undefined;
    if (user.email) {
      emailOtp = user.generateEmailOTP();
    }
    
    await user.save();

    // TODO: Send OTP via SMS service (Twilio/TextLocal)
    // For now, log OTP in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Mobile OTP for ${user.mobile}: ${mobileOtp}`);
      if (emailOtp) {
        console.log(`[DEV] Email OTP for ${user.email}: ${emailOtp}`);
      }
    }

    // Note: No session token created during registration
    // Session token will be created after successful mobile verification
    // This ensures users verify their mobile before being fully authenticated
    const responseData: RegisterResponse = {
      success: true,
      message: 'Registration successful. Please verify your mobile number.',
      user: {
        id: user._id.toString(),
        mobile: user.mobile,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileVerified: user.mobileVerified,
        emailVerified: user.emailVerified,
        role: user.role,
      },
    };
    const response = createSecureResponse(
      {
        ...responseData,
        // Include OTP in development only
        ...(process.env.NODE_ENV === 'development' && { 
          mobileOtp,
          ...(emailOtp && { emailOtp }),
        }),
      },
      200,
      request
    );

    // No session token set - user must verify mobile first
    return response;
  } catch (error) {
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    logError('register API', error);
    return createSecureErrorResponse('Failed to register user', 500, request);
  }
}
