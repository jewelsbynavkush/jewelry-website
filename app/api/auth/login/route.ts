/**
 * User Login API Route
 * 
 * Handles user authentication:
 * - POST: Login with email and password
 * 
 * Features:
 * - Email-only login
 * - Password verification
 * - Account lockout after failed attempts
 * - Session creation
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User, { IUserModel } from '@/models/User';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { sanitizeEmail } from '@/lib/security/sanitize';
import { createSession } from '@/lib/auth/session';
import { formatZodError } from '@/lib/utils/zod-error';
import { getCorrelationId } from '@/lib/security/error-handler';
import { mergeGuestCartToUser } from '@/lib/cart/merge-cart';
import type { LoginRequest, LoginResponse } from '@/types/api';
import { z } from 'zod';

/**
 * Schema for user login with industry-standard validation
 */
const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email must not exceed 254 characters')
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(100, 'Password must not exceed 100 characters'),
});

/**
 * POST /api/auth/login
 * Login user
 */
export async function POST(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  const { SECURITY_CONFIG } = await import('@/lib/security/constants');
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.AUTH,
    requireContentType: true,
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    const body = await request.json() as LoginRequest;
    
    // Reverse client-side obfuscation to get original password before validation
    // Handles both obfuscated (from web client) and plain text (from direct API calls) for backward compatibility
    const { deobfuscateRequestFields } = await import('@/lib/security/request-decryption');
    const deobfuscatedBody = deobfuscateRequestFields(
      body as unknown as Record<string, unknown>, 
      ['password']
    ) as unknown as LoginRequest;
    
    // Log deobfuscation result for debugging (password length only, not actual value)
    if (body.password && typeof body.password === 'string' && body.password.length > 0) {
      const originalLength = body.password.length;
      const deobfuscatedLength = deobfuscatedBody.password?.length || 0;
      if (originalLength !== deobfuscatedLength && originalLength >= 8) {
        // Password was likely obfuscated, log for debugging
        logError('login password deobfuscation', new Error(`Password length changed: ${originalLength} -> ${deobfuscatedLength}. Check if NEXT_PUBLIC_OBFUSCATION_KEY matches OBFUSCATION_KEY or JWT_SECRET.`));
      }
    }
    
    const validatedData = loginSchema.parse(deobfuscatedBody);

    const email = sanitizeEmail(validatedData.identifier);

    // Include lockUntil field directly since isLocked virtual may not be available with .select()
    const user = await User.findOne({ email })
      .select('+password mobile countryCode email firstName lastName role emailVerified isActive isBlocked lockUntil lastLogin lastLoginIP'); // Include password and all needed fields

    if (!user) {
      return createSecureErrorResponse('Invalid credentials', 401, request);
    }

    if (!user.isActive) {
      return createSecureErrorResponse('Account is inactive. Please contact support.', 403, request);
    }

    if (user.isBlocked) {
      return createSecureErrorResponse('Account is blocked. Please contact support.', 403, request);
    }

    // Lock prevents brute force attacks by temporarily disabling account
    if (user.lockUntil && user.lockUntil > new Date()) {
      return createSecureErrorResponse('Account is temporarily locked due to too many failed login attempts. Please try again later.', 423, request);
    }

    // Compare provided password with stored hash using bcrypt timing-safe comparison
    const isPasswordValid = await user.comparePassword(validatedData.password);
    if (!isPasswordValid) {
      // Increment login attempts
      await (User as IUserModel).incrementLoginAttempts(user._id.toString());

      return createSecureErrorResponse('Invalid credentials', 401, request);
    }

    await (User as IUserModel).resetLoginAttempts(user._id.toString());

    user.lastLogin = new Date();
    user.lastLoginIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    await user.save();

    const userData = {
      id: user._id.toString(),
      email: user.email,
      mobile: user.mobile,
      countryCode: user.countryCode,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
      role: user.role,
    };
    
    const responseData: LoginResponse = {
      success: true,
      message: 'Login successful',
      user: userData as LoginResponse['user'],
    };
    const response = createSecureResponse(responseData, 200, request);

    await createSession(user._id.toString(), user.email, user.role, response, request);

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
