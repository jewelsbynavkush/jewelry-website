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
import { SECURITY_CONFIG } from '@/lib/security/constants';
import { indianAddressSchema } from '@/lib/validations/address';
import type { GetAddressesResponse, AddAddressRequest, AddAddressResponse } from '@/types/api';
import { z } from 'zod';

/**
 * Schema for adding address with Indian address validation
 */
const addAddressSchema = indianAddressSchema.extend({
  type: z.enum(['shipping', 'billing', 'both']),
  isDefault: z.boolean().default(false),
});

/**
 * GET /api/users/addresses
 * Get user addresses
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

    // Optimize: Only select address fields
    const userDoc = await User.findById(user.userId)
      .select('addresses defaultShippingAddressId defaultBillingAddressId')
      .lean();
    if (!userDoc) {
      return createSecureErrorResponse('User not found', 404, request);
    }

    const responseData: GetAddressesResponse = {
      addresses: (userDoc.addresses || []).map((addr) => ({
        id: addr.id,
        type: addr.type,
        firstName: addr.firstName,
        lastName: addr.lastName,
        company: addr.company,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zipCode,
        country: addr.country,
        phone: addr.phone,
        countryCode: addr.countryCode,
        isDefault: addr.isDefault,
      })),
      defaultShippingAddressId: userDoc.defaultShippingAddressId?.toString(),
      defaultBillingAddressId: userDoc.defaultBillingAddressId?.toString(),
    };
    const response = createSecureResponse(responseData, 200, request);
    
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

    // Validate address data to ensure all required fields are present and properly formatted
    const body = await request.json() as AddAddressRequest;
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
      phone: sanitizePhone(validatedData.phone),
      countryCode: sanitizeString(validatedData.countryCode || '+91'),
      isDefault: validatedData.isDefault,
    };

    // Add new address to user's address list
    // If this is the first address or marked as default, it becomes the default address
    const addressId = userDoc.addAddress(addressData);
    await userDoc.save();

    const responseData: AddAddressResponse = {
      success: true,
      message: 'Address added successfully',
      addressId,
      addresses: userDoc.addresses.map((addr) => ({
        id: addr.id,
        type: addr.type,
        firstName: addr.firstName,
        lastName: addr.lastName,
        company: addr.company,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zipCode,
        country: addr.country,
        phone: addr.phone,
        countryCode: addr.countryCode,
        isDefault: addr.isDefault,
      })),
      defaultShippingAddressId: userDoc.defaultShippingAddressId?.toString(),
      defaultBillingAddressId: userDoc.defaultBillingAddressId?.toString(),
    };
    return createSecureResponse(responseData, 200, request);
  } catch (error) {
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    logError('user addresses POST API', error);
    return createSecureErrorResponse('Failed to add address', 500, request);
  }
}
