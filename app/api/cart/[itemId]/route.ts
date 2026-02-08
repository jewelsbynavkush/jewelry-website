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
import { getSessionId } from '@/lib/utils/api-helpers';
import { ECOMMERCE } from '@/lib/constants';
import { SECURITY_CONFIG } from '@/lib/security/constants';
import { getEcommerceSettings } from '@/lib/utils/site-settings-helpers';
import type { UpdateCartItemRequest, UpdateCartItemResponse } from '@/types/api';
import { z } from 'zod';
import { reserveStockForCart, releaseReservedStock } from '@/lib/inventory/inventory-service';

/**
 * Schema for updating item quantity with industry-standard validation
 */
const updateQuantitySchema = z.object({
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(0, 'Quantity must be at least 0')
    .max(ECOMMERCE.maxQuantityPerItem, `Quantity cannot exceed ${ECOMMERCE.maxQuantityPerItem}`),
});

/**
 * PATCH /api/cart/[itemId]
 * Update item quantity in cart
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.CART,
    requireContentType: true,
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    const ecommerce = await getEcommerceSettings();

    const { itemId } = await params;
    const sanitizedItemId = sanitizeString(itemId);

    const body = await request.json() as UpdateCartItemRequest;
    const validatedData = updateQuantitySchema.parse(body);

    const user = await optionalAuth(request);
    const sessionId = getSessionId(request);

    const cart = await Cart.findOne(
      user ? { userId: user.userId } : { sessionId }
    ).select('items subtotal tax shipping discount total currency');

    if (!cart) {
      return createSecureErrorResponse('Cart not found', 404, request);
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === sanitizedItemId
    );

    if (itemIndex === -1) {
      return createSecureErrorResponse('Item not found in cart', 404, request);
    }

    const currentItem = cart.items[itemIndex];
    const oldQuantity = currentItem.quantity;

    if (validatedData.quantity === 0) {
      if (currentItem.productId) {
        const product = await Product.findById(currentItem.productId)
          .select('inventory.trackQuantity')
          .lean();
        
        if (product?.inventory.trackQuantity) {
          await releaseReservedStock(
            currentItem.productId.toString(),
            oldQuantity,
            user?.userId
          );
        }
      }
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await Product.findById(sanitizedItemId)
        .select('status inventory.quantity inventory.reservedQuantity inventory.trackQuantity inventory.allowBackorder price')
        .lean();
      if (!product || product.status !== 'active') {
        return createSecureErrorResponse('Product is no longer available', 400, request);
      }

      if (product.inventory.trackQuantity) {
        const availableQuantity = Math.max(0, product.inventory.quantity - product.inventory.reservedQuantity);
        if (availableQuantity < validatedData.quantity && !product.inventory.allowBackorder) {
          return createSecureErrorResponse(`Insufficient stock for ${product.sku}`, 400, request);
        }
      }

      const priceVariance = Math.abs(product.price - currentItem.price) / currentItem.price;
      if (priceVariance > (ecommerce.priceVarianceThreshold ?? ECOMMERCE.priceVarianceThreshold)) {
        cart.items[itemIndex].price = product.price;
        cart.items[itemIndex].sku = product.sku;
        cart.items[itemIndex].title = product.title;
        const newImage = product.primaryImage || product.images[0] || '';
        if (cart.items[itemIndex].image !== newImage) {
          cart.items[itemIndex].image = newImage;
        }
      }

      if (product.inventory.trackQuantity && currentItem.productId) {
        const quantityDifference = validatedData.quantity - oldQuantity;
        
        if (quantityDifference > 0) {
          // Increase quantity - reserve additional stock
          const reservationResult = await reserveStockForCart(
            currentItem.productId.toString(),
            quantityDifference,
            user?.userId
          );
          
          if (!reservationResult.success) {
            return createSecureErrorResponse(
              reservationResult.error || 'Failed to reserve stock',
              400,
              request
            );
          }
        } else if (quantityDifference < 0) {
          // Decrease quantity - release excess stock
          await releaseReservedStock(
            currentItem.productId.toString(),
            Math.abs(quantityDifference),
            user?.userId
          );
        }
      }

      cart.items[itemIndex].quantity = validatedData.quantity;
      cart.items[itemIndex].subtotal = cart.items[itemIndex].price * validatedData.quantity;
    }

    // Recalculate totals after quantity change
    const freeShippingThreshold = ecommerce.freeShippingThreshold ?? ECOMMERCE.freeShippingThreshold;
    const defaultShippingCost = ecommerce.defaultShippingCost ?? ECOMMERCE.defaultShippingCost;
    cart.calculateTotals(freeShippingThreshold, defaultShippingCost);
    
    // Calculate tax after cart totals to ensure tax is applied to correct subtotal
    // Tax calculation depends on e-commerce configuration (18% GST in India)
    const calculateTax = ecommerce.calculateTax ?? ECOMMERCE.calculateTax;
    const taxRate = ecommerce.taxRate ?? ECOMMERCE.taxRate;
    if (calculateTax && taxRate > 0) {
      cart.tax = Math.round(cart.subtotal * taxRate * 100) / 100;
      cart.calculateTotals(freeShippingThreshold, defaultShippingCost);
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
  // Higher limit for cart operations - 200 requests per 15 minutes
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.CART,
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    const ecommerce = await getEcommerceSettings();

    const { itemId } = await params;
    const sanitizedItemId = sanitizeString(itemId);

    const user = await optionalAuth(request);
    const sessionId = getSessionId(request);

    const cart = await Cart.findOne(
      user ? { userId: user.userId } : { sessionId }
    ).select('items subtotal tax shipping discount total currency');

    if (!cart) {
      return createSecureErrorResponse('Cart not found', 404, request);
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === sanitizedItemId
    );

    if (itemIndex === -1) {
      return createSecureErrorResponse('Item not found in cart', 404, request);
    }

    const removedItem = cart.items[itemIndex];

    if (removedItem.productId) {
      const product = await Product.findById(removedItem.productId)
        .select('inventory.trackQuantity')
        .lean();
      
      if (product?.inventory.trackQuantity) {
        await releaseReservedStock(
          removedItem.productId.toString(),
          removedItem.quantity,
          user?.userId
        );
      }
    }

    cart.items.splice(itemIndex, 1);

    const freeShippingThreshold = ecommerce.freeShippingThreshold ?? ECOMMERCE.freeShippingThreshold;
    const defaultShippingCost = ecommerce.defaultShippingCost ?? ECOMMERCE.defaultShippingCost;
    cart.calculateTotals(freeShippingThreshold, defaultShippingCost);
    
    // Calculate tax after cart totals to ensure tax is applied to correct subtotal
    // Tax calculation depends on e-commerce configuration (18% GST in India)
    const calculateTax = ecommerce.calculateTax ?? ECOMMERCE.calculateTax;
    const taxRate = ecommerce.taxRate ?? ECOMMERCE.taxRate;
    if (calculateTax && taxRate > 0) {
      cart.tax = Math.round(cart.subtotal * taxRate * 100) / 100;
      cart.calculateTotals(freeShippingThreshold, defaultShippingCost);
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
