/**
 * User Addresses API Route
 * 
 * Handles user address operations:
 * - GET: Get user addresses
 * - POST: Add new address
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth/middleware';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { sanitizeString, sanitizePhone } from '@/lib/security/sanitize';
import { formatZodError } from '@/lib/utils/zod-error';
import { z } from 'zod';

/**
 * Schema for adding address
 */
const addAddressSchema = z.object({
  type: z.enum(['shipping', 'billing', 'both']),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  company: z.string().max(100).optional(),
  addressLine1: z.string().min(1, 'Address line 1 is required').max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  zipCode: z.string().min(1, 'ZIP code is required').max(20),
  country: z.string().min(1, 'Country is required').max(100),
  phone: z.string().max(20).optional(),
  isDefault: z.boolean().default(false),
});

/**
 * GET /api/users/addresses
 * Get user addresses
 */
export async function GET(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  // Industry standard: 100 requests per 15 minutes for user-specific read endpoints
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

    // Optimize: Only select address fields
    const userDoc = await User.findById(user.userId)
      .select('addresses defaultShippingAddressId defaultBillingAddressId')
      .lean();
    if (!userDoc) {
      return createSecureErrorResponse('User not found', 404, request);
    }

    const response = createSecureResponse(
      {
        addresses: userDoc.addresses || [],
        defaultShippingAddressId: userDoc.defaultShippingAddressId,
        defaultBillingAddressId: userDoc.defaultBillingAddressId,
      },
      200,
      request
    );
    
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return response;
  } catch (error) {
    logError('user addresses GET API', error);
    return createSecureErrorResponse('Failed to retrieve addresses', 500, request);
  }
}

/**
 * POST /api/users/addresses
 * Add new address
 */
export async function POST(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  // Industry standard: 50 write operations per 15 minutes for address modifications
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

    // Parse and validate request body - ensures all required address fields are present
    const body = await request.json();
    const validatedData = addAddressSchema.parse(body);

    // Optimize: Only select fields needed for address operations
    const userDoc = await User.findById(user.userId)
      .select('addresses defaultShippingAddressId defaultBillingAddressId');
    if (!userDoc) {
      return createSecureErrorResponse('User not found', 404, request);
    }

    // Sanitize address data
    const addressData = {
      type: validatedData.type,
      firstName: sanitizeString(validatedData.firstName),
      lastName: sanitizeString(validatedData.lastName),
      company: validatedData.company ? sanitizeString(validatedData.company) : undefined,
      addressLine1: sanitizeString(validatedData.addressLine1),
      addressLine2: validatedData.addressLine2 ? sanitizeString(validatedData.addressLine2) : undefined,
      city: sanitizeString(validatedData.city),
      state: sanitizeString(validatedData.state),
      zipCode: sanitizeString(validatedData.zipCode),
      country: sanitizeString(validatedData.country),
      phone: validatedData.phone ? sanitizePhone(validatedData.phone) : undefined,
      isDefault: validatedData.isDefault,
    };

    // Add new address to user's address list
    // If this is the first address or marked as default, it becomes the default address
    const addressId = userDoc.addAddress(addressData);
    await userDoc.save();

    return createSecureResponse(
      {
        success: true,
        message: 'Address added successfully',
        addressId,
        addresses: userDoc.addresses,
        defaultShippingAddressId: userDoc.defaultShippingAddressId,
        defaultBillingAddressId: userDoc.defaultBillingAddressId,
      },
      200,
      request
    );
  } catch (error) {
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    logError('user addresses POST API', error);
    return createSecureErrorResponse('Failed to add address', 500, request);
  }
}
