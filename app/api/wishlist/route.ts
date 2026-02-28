/**
 * Wishlist API Route
 *
 * GET: Return authenticated user's wishlist product IDs.
 * POST: Add a product to the wishlist (body: { productId }).
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, Product } from '@/models';
import { requireAuth } from '@/lib/auth/middleware';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { formatZodError } from '@/lib/utils/zod-error';
import { validateObjectIdParam } from '@/lib/utils/api-helpers';
import { SECURITY_CONFIG } from '@/lib/security/constants';
import type { GetWishlistResponse, AddToWishlistRequest, WishlistResponse } from '@/types/api';
import { z } from 'zod';

const addToWishlistSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

export async function GET(request: NextRequest) {
  const securityResponse = await applyApiSecurity(request, {
    enableRateLimit: false,
  });
  if (securityResponse) return securityResponse;

  try {
    const authResult = await requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const { checkUserRateLimit } = await import('@/lib/security/api-security');
    const userRateLimitResponse = await checkUserRateLimit(
      request,
      authResult.user.userId,
      SECURITY_CONFIG.RATE_LIMIT.USER_PROFILE_READ
    );
    if (userRateLimitResponse) return userRateLimitResponse;

    await connectDB();

    const userDoc = await User.findById(authResult.user.userId)
      .select('wishlist')
      .lean();
    if (!userDoc) {
      return createSecureErrorResponse('User not found', 404, request);
    }

    const productIds = (userDoc.wishlist || []).map((id) => id.toString());
    const responseData: GetWishlistResponse = { productIds };
    return createSecureResponse(responseData, 200, request);
  } catch (error) {
    logError('wishlist GET API', error);
    return createSecureErrorResponse('Failed to get wishlist', 500, request);
  }
}

export async function POST(request: NextRequest) {
  const securityResponse = await applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.CART,
    requireContentType: true,
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

    const body = (await request.json()) as AddToWishlistRequest;
    const parsed = addToWishlistSchema.safeParse(body);
    if (!parsed.success) {
      const formatted = formatZodError(parsed.error);
      return createSecureResponse(formatted, 400, request);
    }

    const validationResult = await validateObjectIdParam(parsed.data.productId, 'product ID', request);
    if ('error' in validationResult) return validationResult.error;
    const productId = validationResult.value;

    await connectDB();

    const productExists = await Product.findById(productId).select('_id').lean();
    if (!productExists) {
      return createSecureErrorResponse('Product not found', 404, request);
    }

    const userDoc = await User.findById(authResult.user.userId).select('wishlist');
    if (!userDoc) {
      return createSecureErrorResponse('User not found', 404, request);
    }

    const wishlist = userDoc.wishlist || [];
    const idObj = productExists._id;
    if (wishlist.some((id) => id.toString() === productId)) {
      const responseData: WishlistResponse = {
        success: true,
        productIds: wishlist.map((id) => id.toString()),
        message: 'Already in wishlist',
      };
      return createSecureResponse(responseData, 200, request);
    }

    userDoc.wishlist = [...wishlist, idObj];
    await userDoc.save();

    const responseData: WishlistResponse = {
      success: true,
      productIds: userDoc.wishlist.map((id) => id.toString()),
    };
    return createSecureResponse(responseData, 200, request);
  } catch (error) {
    const zodError = formatZodError(error);
    if (zodError) return createSecureResponse(zodError, 400, request);
    logError('wishlist POST API', error);
    return createSecureErrorResponse('Failed to add to wishlist', 500, request);
  }
}
