/**
 * User Address Detail API Route
 * 
 * Handles individual address operations:
 * - PATCH: Update address
 * - DELETE: Delete address
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
import type { UpdateAddressRequest, UpdateAddressResponse, DeleteAddressResponse } from '@/types/api';
import { z } from 'zod';

/**
 * Schema for updating address with Indian address validation
 * All fields are optional for partial updates
 */
const updateAddressSchema = indianAddressSchema.partial().extend({
  type: z.enum(['shipping', 'billing', 'both']).optional(),
  isDefault: z.boolean().optional(),
});

/**
 * PATCH /api/users/addresses/[addressId]
 * Update address
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
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

    const { addressId } = await params;
    const sanitizedAddressId = sanitizeString(addressId);

    await connectDB();

    // Validate address data before update to ensure required fields and format compliance
    const body = await request.json() as UpdateAddressRequest;
    const validatedData = updateAddressSchema.parse(body);

    // Optimize: Only select fields needed for address operations
    const userDoc = await User.findById(user.userId)
      .select('addresses defaultShippingAddressId defaultBillingAddressId');
    if (!userDoc) {
      return createSecureErrorResponse('User not found', 404, request);
    }

    // Locate address in user's address list by ID
    // Ensures address belongs to user before allowing update
    const addressIndex = userDoc.addresses.findIndex((addr) => addr.id === sanitizedAddressId);
    if (addressIndex === -1) {
      return createSecureErrorResponse('Address not found', 404, request);
    }

    // Update only provided fields with sanitized input to prevent XSS attacks
    // Partial updates allow flexible address modifications without requiring all fields
    const address = userDoc.addresses[addressIndex];
    if (validatedData.type !== undefined) address.type = validatedData.type;
    if (validatedData.firstName !== undefined) address.firstName = sanitizeString(validatedData.firstName);
    if (validatedData.lastName !== undefined) address.lastName = sanitizeString(validatedData.lastName);
    if (validatedData.company !== undefined) address.company = validatedData.company ? sanitizeString(validatedData.company) : undefined;
    if (validatedData.addressLine1 !== undefined) address.addressLine1 = sanitizeString(validatedData.addressLine1);
    if (validatedData.addressLine2 !== undefined) address.addressLine2 = validatedData.addressLine2 ? sanitizeString(validatedData.addressLine2) : undefined;
    if (validatedData.city !== undefined) address.city = sanitizeString(validatedData.city);
    if (validatedData.state !== undefined) address.state = sanitizeString(validatedData.state);
    if (validatedData.zipCode !== undefined) address.zipCode = sanitizeString(validatedData.zipCode);
    if (validatedData.country !== undefined) address.country = sanitizeString(validatedData.country);
    if (validatedData.phone !== undefined && validatedData.phone) {
      address.phone = sanitizePhone(validatedData.phone);
    }
    if (validatedData.isDefault !== undefined) {
      address.isDefault = validatedData.isDefault;
      
      // Update default address IDs if this is set as default
      if (validatedData.isDefault) {
        if (address.type === 'shipping' || address.type === 'both') {
          userDoc.defaultShippingAddressId = address.id;
        }
        if (address.type === 'billing' || address.type === 'both') {
          userDoc.defaultBillingAddressId = address.id;
        }
        
        // Clear other default flags
        userDoc.addresses.forEach((addr) => {
          if (addr.id !== address.id) {
            addr.isDefault = false;
          }
        });
      }
    }

    address.updatedAt = new Date();
    await userDoc.save();

    const responseData: UpdateAddressResponse = {
      success: true,
      message: 'Address updated successfully',
      address: {
        id: address.id,
        type: address.type,
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        phone: address.phone,
        countryCode: address.countryCode,
        isDefault: address.isDefault,
      },
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

    logError('user address PATCH API', error);
    return createSecureErrorResponse('Failed to update address', 500, request);
  }
}

/**
 * DELETE /api/users/addresses/[addressId]
 * Delete address
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
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
      SECURITY_CONFIG.RATE_LIMIT.USER_PROFILE_WRITE
    );
    if (userRateLimitResponse) return userRateLimitResponse;

    const { addressId } = await params;
    const sanitizedAddressId = sanitizeString(addressId);

    await connectDB();

    // Optimize: Only select fields needed for address operations
    const userDoc = await User.findById(user.userId)
      .select('addresses defaultShippingAddressId defaultBillingAddressId');
    if (!userDoc) {
      return createSecureErrorResponse('User not found', 404, request);
    }

    // Locate and remove address from user's address list
    // Ensures address belongs to user before deletion
    const addressIndex = userDoc.addresses.findIndex((addr) => addr.id === sanitizedAddressId);
    if (addressIndex === -1) {
      return createSecureErrorResponse('Address not found', 404, request);
    }

    // Clear default address IDs if this was the default
    const address = userDoc.addresses[addressIndex];
    if (userDoc.defaultShippingAddressId === address.id) {
      userDoc.defaultShippingAddressId = undefined;
    }
    if (userDoc.defaultBillingAddressId === address.id) {
      userDoc.defaultBillingAddressId = undefined;
    }

    userDoc.addresses.splice(addressIndex, 1);
    await userDoc.save();

    const responseData: DeleteAddressResponse = {
      success: true,
      message: 'Address deleted successfully',
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
    };
    return createSecureResponse(responseData, 200, request);
  } catch (error) {
    logError('user address DELETE API', error);
    return createSecureErrorResponse('Failed to delete address', 500, request);
  }
}
