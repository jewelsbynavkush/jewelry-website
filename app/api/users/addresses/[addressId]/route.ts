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
import { z } from 'zod';

/**
 * Schema for updating address
 */
const updateAddressSchema = z.object({
  type: z.enum(['shipping', 'billing', 'both']).optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  company: z.string().max(100).optional(),
  addressLine1: z.string().min(1).max(200).optional(),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  zipCode: z.string().min(1).max(20).optional(),
  country: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
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
    const { addressId } = await params;
    const sanitizedAddressId = sanitizeString(addressId);

    await connectDB();

    // Parse and validate request body - ensures address data is valid before updating
    const body = await request.json();
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

    // Update address fields with sanitized input to prevent XSS
    // Only updates fields that are provided in request
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
    if (validatedData.phone !== undefined) address.phone = validatedData.phone ? sanitizePhone(validatedData.phone) : undefined;
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

    return createSecureResponse(
      {
        success: true,
        message: 'Address updated successfully',
        address,
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
  // Apply security (CORS, CSRF, rate limiting)
  // Industry standard: 50 write operations per 15 minutes for address modifications
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 50 }, // 50 requests per 15 minutes (industry standard)
  });
  if (securityResponse) return securityResponse;

  try {
    const authResult = await requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { user } = authResult;
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

    return createSecureResponse(
      {
        success: true,
        message: 'Address deleted successfully',
        addresses: userDoc.addresses,
        defaultShippingAddressId: userDoc.defaultShippingAddressId,
        defaultBillingAddressId: userDoc.defaultBillingAddressId,
      },
      200,
      request
    );
  } catch (error) {
    logError('user address DELETE API', error);
    return createSecureErrorResponse('Failed to delete address', 500, request);
  }
}
