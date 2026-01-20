/**
 * Cart Item API Route
 * 
 * Handles individual cart item operations:
 * - PATCH: Update item quantity
 * - DELETE: Remove item from cart
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { optionalAuth } from '@/lib/auth/middleware';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { sanitizeString } from '@/lib/security/sanitize';
import { formatZodError } from '@/lib/utils/zod-error';
import { ECOMMERCE } from '@/lib/constants';
import type { UpdateCartItemRequest, UpdateCartItemResponse } from '@/types/api';
import { z } from 'zod';
import mongoose from 'mongoose';

/**
 * Schema for updating item quantity
 */
const updateQuantitySchema = z.object({
  quantity: z.number().int().min(0, 'Quantity must be at least 0').max(100, 'Quantity cannot exceed 100'),
});

/**
 * Get session ID for guest carts
 */
function getSessionId(request: NextRequest): string {
  const sessionCookie = request.cookies.get('session-id');
  if (sessionCookie?.value) {
    return sessionCookie.value;
  }
  return new mongoose.Types.ObjectId().toString();
}

/**
 * PATCH /api/cart/[itemId]
 * Update item quantity in cart
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  // Apply security (CORS, CSRF, rate limiting)
  // Industry standard: 50 write operations per 15 minutes for cart modifications
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 50 }, // 50 requests per 15 minutes (industry standard)
    requireContentType: true,
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    const { itemId } = await params;
    const sanitizedItemId = sanitizeString(itemId);

    // Parse and validate request body - ensures quantity is valid before updating cart
    const body = await request.json() as UpdateCartItemRequest;
    const validatedData = updateQuantitySchema.parse(body);

    const user = await optionalAuth(request);
    const sessionId = getSessionId(request);

    const cart = await Cart.findOne(
      user ? { userId: user.userId } : { sessionId }
    );

    if (!cart) {
      return createSecureErrorResponse('Cart not found', 404, request);
    }

    // Locate item in cart by productId to update or remove
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === sanitizedItemId
    );

    if (itemIndex === -1) {
      return createSecureErrorResponse('Item not found in cart', 404, request);
    }

    if (validatedData.quantity === 0) {
      // Remove item when quantity set to 0 (user intent to remove)
      cart.items.splice(itemIndex, 1);
          } else {
            // Refresh product data to ensure cart reflects current pricing and availability
            const product = await Product.findById(sanitizedItemId).lean();
      if (!product || product.status !== 'active') {
        return createSecureErrorResponse('Product is no longer available', 400, request);
      }

            // Verify stock availability before updating quantity
            // Prevents setting quantity higher than available stock unless backorder is allowed
            if (product.inventory.trackQuantity) {
        const availableQuantity = Math.max(0, product.inventory.quantity - product.inventory.reservedQuantity);
        if (availableQuantity < validatedData.quantity && !product.inventory.allowBackorder) {
          return createSecureErrorResponse(`Only ${availableQuantity} items available in stock`, 400, request);
        }
      }

      cart.items[itemIndex].quantity = validatedData.quantity;
      cart.items[itemIndex].subtotal = cart.items[itemIndex].price * validatedData.quantity;
    }

    // Recalculate totals after quantity change
    // Applies free shipping threshold and default shipping cost
    cart.calculateTotals(ECOMMERCE.freeShippingThreshold, ECOMMERCE.defaultShippingCost);
    
    // Calculate tax if enabled (must recalculate totals after tax calculation)
    if (ECOMMERCE.calculateTax && ECOMMERCE.taxRate > 0) {
      cart.tax = Math.round(cart.subtotal * ECOMMERCE.taxRate * 100) / 100;
      cart.calculateTotals(ECOMMERCE.freeShippingThreshold, ECOMMERCE.defaultShippingCost);
    }
    
    await cart.save();

    const responseData: UpdateCartItemResponse = {
      success: true,
      message: validatedData.quantity === 0 ? 'Item removed from cart' : 'Item quantity updated',
      cart: {
        id: cart._id.toString(),
        items: cart.items.map((item) => ({
          productId: item.productId.toString(),
          sku: item.sku,
          title: item.title,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        discount: cart.discount,
        total: cart.total,
        currency: cart.currency,
      },
    };
    return createSecureResponse(responseData, 200, request);
  } catch (error) {
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    logError('cart item PATCH API', error);
    return createSecureErrorResponse('Failed to update cart item', 500, request);
  }
}

/**
 * DELETE /api/cart/[itemId]
 * Remove item from cart
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  // Apply security (CORS, CSRF, rate limiting)
  // Industry standard: 50 write operations per 15 minutes for cart modifications
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 50 }, // 50 requests per 15 minutes (industry standard)
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    const { itemId } = await params;
    const sanitizedItemId = sanitizeString(itemId);

    const user = await optionalAuth(request);
    const sessionId = getSessionId(request);

    const cart = await Cart.findOne(
      user ? { userId: user.userId } : { sessionId }
    );

    if (!cart) {
      return createSecureErrorResponse('Cart not found', 404, request);
    }

    // Locate and remove item from cart by productId
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === sanitizedItemId
    );

    if (itemIndex === -1) {
      return createSecureErrorResponse('Item not found in cart', 404, request);
    }

    cart.items.splice(itemIndex, 1);

    // Recalculate totals after item removal
    // Applies free shipping threshold and default shipping cost
    cart.calculateTotals(ECOMMERCE.freeShippingThreshold, ECOMMERCE.defaultShippingCost);
    
    // Calculate tax if enabled (must recalculate totals after tax calculation)
    if (ECOMMERCE.calculateTax && ECOMMERCE.taxRate > 0) {
      cart.tax = Math.round(cart.subtotal * ECOMMERCE.taxRate * 100) / 100;
      cart.calculateTotals(ECOMMERCE.freeShippingThreshold, ECOMMERCE.defaultShippingCost);
    }
    
    await cart.save();

    const responseData: UpdateCartItemResponse = {
      success: true,
      message: 'Item removed from cart',
      cart: {
        id: cart._id.toString(),
        items: cart.items.map((item) => ({
          productId: item.productId.toString(),
          sku: item.sku,
          title: item.title,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        discount: cart.discount,
        total: cart.total,
        currency: cart.currency,
      },
    };
    return createSecureResponse(responseData, 200, request);
  } catch (error) {
    logError('cart item DELETE API', error);
    return createSecureErrorResponse('Failed to remove item from cart', 500, request);
  }
}
