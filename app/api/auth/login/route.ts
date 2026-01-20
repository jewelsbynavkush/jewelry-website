/**
 * User Login API Route
 * 
 * Handles user authentication:
 * - POST: Login with mobile/email and password
 * 
 * Features:
 * - Mobile or email login
 * - Password verification
 * - Account lockout after failed attempts
 * - Session creation
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User, { IUserModel } from '@/models/User';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { sanitizeString, sanitizeEmail } from '@/lib/security/sanitize';
import { createSession } from '@/lib/auth/session';
import { formatZodError } from '@/lib/utils/zod-error';
import { getCorrelationId } from '@/lib/security/error-handler';
import { mergeGuestCartToUser } from '@/lib/cart/merge-cart';
import type { LoginRequest, LoginResponse } from '@/types/api';
import { z } from 'zod';

/**
 * Schema for user login
 */
const loginSchema = z.object({
  identifier: z.string().min(1, 'Mobile number or email is required'), // Mobile or email
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /api/auth/login
 * Login user
 */
export async function POST(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  // Industry standard: 10 login attempts per 15 minutes (same for all environments)
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { 
      windowMs: 15 * 60 * 1000, 
      maxRequests: 50 // 50 login attempts per 15 minutes
    },
    requireContentType: true,
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    // Parse and validate request body - ensures identifier and password are provided
    const body = await request.json() as LoginRequest;
    const validatedData = loginSchema.parse(body);

    // Determine if identifier is mobile or email
    const isEmail = validatedData.identifier.includes('@');
    const identifier = isEmail ? sanitizeEmail(validatedData.identifier) : sanitizeString(validatedData.identifier);

    // Find user - Optimize: Only select fields needed for login
    // Include lockUntil to check account lock status (isLocked is a virtual)
    const user = await User.findOne(
      isEmail ? { email: identifier } : { mobile: identifier }
    ).select('+password mobile email firstName lastName role mobileVerified emailVerified isActive isBlocked lockUntil lastLogin lastLoginIP'); // Include password and all needed fields

    if (!user) {
      return createSecureErrorResponse('Invalid credentials', 401, request);
    }

    // Verify account is active - inactive accounts cannot authenticate
    if (!user.isActive) {
      return createSecureErrorResponse('Account is inactive. Please contact support.', 403, request);
    }

    // Verify account is not blocked - blocked accounts are permanently disabled
    if (user.isBlocked) {
      return createSecureErrorResponse('Account is blocked. Please contact support.', 403, request);
    }

    // Verify account is not temporarily locked due to failed login attempts
    // Lock prevents brute force attacks by temporarily disabling account
    // Check lockUntil directly since isLocked virtual may not be available with .select()
    if (user.lockUntil && user.lockUntil > new Date()) {
      return createSecureErrorResponse('Account is temporarily locked due to too many failed login attempts. Please try again later.', 423, request);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(validatedData.password);
    if (!isPasswordValid) {
      // Increment login attempts
      await (User as IUserModel).incrementLoginAttempts(user._id.toString());

      return createSecureErrorResponse('Invalid credentials', 401, request);
    }

    // Reset login attempts on successful login to clear any temporary locks
    await (User as IUserModel).resetLoginAttempts(user._id.toString());

    // Track last login timestamp and IP for security auditing
    user.lastLogin = new Date();
    user.lastLoginIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    await user.save();

    // Industry standard: Create session with access token and refresh token
    const responseData: LoginResponse = {
      success: true,
      message: 'Login successful',
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
    const response = createSecureResponse(responseData, 200, request);

    // Create session with access token (1 hour) and refresh token (30 days)
    // Industry standard: Separate short-lived access tokens and long-lived refresh tokens
    await createSession(user._id.toString(), user.mobile, user.role, response, request);

    // Merge guest cart into user cart (industry standard: preserve guest cart on login)
    // Get sessionId from cookie if available
    const sessionCookie = request.cookies.get('session-id');
    if (sessionCookie?.value) {
      try {
        await mergeGuestCartToUser(user._id.toString(), sessionCookie.value);
      } catch (error) {
        // Log error but don't fail login - cart merge is non-critical
        logError('cart merge on login', error);
      }
    }

    return response;
  } catch (error) {
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    const correlationId = getCorrelationId(request);
    logError('login API', error, correlationId);
    return createSecureErrorResponse('Failed to login', 500, request);
  }
}
