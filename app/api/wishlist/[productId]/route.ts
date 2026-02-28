/**
 * Wishlist Item API Route
 *
 * DELETE: Remove a product from the authenticated user's wishlist.
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';
import { requireAuth } from '@/lib/auth/middleware';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { validateObjectIdParam } from '@/lib/utils/api-helpers';
import { SECURITY_CONFIG } from '@/lib/security/constants';
import type { WishlistResponse } from '@/types/api';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const securityResponse = await applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.CART,
  });
  if (securityResponse) return securityResponse;

  try {
    const authResult = await requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const { checkUserRateLimit } = await import('@/lib/security/api-security');
    const userRateLimitResponse = await checkUserRateLimit(
      request,
      authResult.user.userId,
      SECURITY_CONFIG.RATE_LIMIT.USER_PROFILE_WRITE
    );
    if (userRateLimitResponse) return userRateLimitResponse;

    const { productId } = await params;
    const validationResult = await validateObjectIdParam(productId, 'product ID', request);
    if ('error' in validationResult) return validationResult.error;
    const validProductId = validationResult.value;

    await connectDB();

    const userDoc = await User.findById(authResult.user.userId).select('wishlist');
    if (!userDoc) {
      return createSecureErrorResponse('User not found', 404, request);
    }

    const wishlist = userDoc.wishlist || [];
    const newWishlist = wishlist.filter((id) => id.toString() !== validProductId);

    if (newWishlist.length === wishlist.length) {
      const responseData: WishlistResponse = {
        success: true,
        productIds: wishlist.map((id) => id.toString()),
        message: 'Product was not in wishlist',
      };
      return createSecureResponse(responseData, 200, request);
    }

    userDoc.wishlist = newWishlist;
    await userDoc.save();

    const responseData: WishlistResponse = {
      success: true,
      productIds: userDoc.wishlist.map((id) => id.toString()),
    };
    return createSecureResponse(responseData, 200, request);
  } catch (error) {
    logError('wishlist DELETE API', error);
    return createSecureErrorResponse('Failed to remove from wishlist', 500, request);
  }
}
