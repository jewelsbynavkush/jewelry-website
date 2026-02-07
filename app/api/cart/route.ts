/**
 * Cart API Route
 * 
 * Handles shopping cart operations:
 * - GET: Retrieve user/guest cart
 * - POST: Add item to cart
 * - DELETE: Clear entire cart
 * 
 * Supports both authenticated users and guest sessions
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { optionalAuth } from '@/lib/auth/middleware';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { formatZodError } from '@/lib/utils/zod-error';
import { getSessionId } from '@/lib/utils/api-helpers';
import { ECOMMERCE } from '@/lib/constants';
import { SECURITY_CONFIG } from '@/lib/security/constants';
import { getEcommerceSettings } from '@/lib/utils/site-settings-helpers';
import type { GetCartResponse, AddToCartRequest, AddToCartResponse } from '@/types/api';
import { z } from 'zod';
import mongoose from 'mongoose';
import { reserveStockForCart, releaseReservedStock } from '@/lib/inventory/inventory-service';

/**
 * Schema for adding item to cart with industry-standard validation
 */
const addToCartSchema = z.object({
  productId: z
    .string()
    .min(1, 'Product ID is required')
    .max(100, 'Product ID is too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Product ID contains invalid characters'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(ECOMMERCE.maxQuantityPerItem, `Quantity cannot exceed ${ECOMMERCE.maxQuantityPerItem}`),
});

/**
 * GET /api/cart
 * Retrieve user's cart or guest cart
 */
export async function GET(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.CART,
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    // Get e-commerce settings once for use throughout the function
    const ecommerce = await getEcommerceSettings();

    // Try to authenticate (optional for guest carts)
    const user = await optionalAuth(request);
    const sessionId = getSessionId(request);

    let cart;

    if (user) {
      // Authenticated users have persistent carts tied to their account
      cart = await Cart.findOne({ userId: user.userId }).lean();
    } else {
      // Guest users have temporary carts tied to session for cart persistence
      cart = await Cart.findOne({ sessionId }).lean();
    }

    if (!cart) {
      // Return empty cart structure for consistent API response format
      // Ensures frontend always receives a valid cart object even when no cart exists
      return createSecureResponse(
        {
          cart: {
            items: [],
            subtotal: 0,
            tax: 0,
            shipping: 0,
            discount: 0,
            total: 0,
            currency: ecommerce.currency ?? ECOMMERCE.currency,
          },
        },
        200,
        request
      );
    }

    // E-commerce best practice: Validate cart items on retrieval
    // Ensures cart reflects current product availability, status, and pricing
    // Removes invalid items and updates prices if changed
    const validItems: Array<{
      productId: mongoose.Types.ObjectId;
      sku: string;
      title: string;
      image: string;
      price: number;
      quantity: number;
      subtotal: number;
    }> = [];
    let cartNeedsUpdate = false;

    for (const item of cart.items) {
      const product = await Product.findById(item.productId)
        .select('status inventory.quantity inventory.reservedQuantity inventory.trackQuantity inventory.allowBackorder price sku title primaryImage images')
        .lean();

      // Remove items for products that no longer exist or are inactive
      // E-commerce best practice: Keep cart synchronized with current product availability
      if (!product || product.status !== 'active') {
        cartNeedsUpdate = true;
        // Release reserved stock for removed items to prevent inventory lockup
        // Attempt to release stock if product exists and tracks quantity
        if (item.productId && product?.inventory?.trackQuantity) {
          // Release reserved stock immediately if product still exists
          // If product was deleted, stock will be released via cart expiration cleanup job
          if (product?.inventory?.trackQuantity) {
            try {
              const { releaseReservedStock } = await import('@/lib/inventory/inventory-service');
              await releaseReservedStock(
                item.productId.toString(),
                item.quantity,
                user?.userId
              );
            } catch (error) {
              // Log but don't fail - stock release is best effort
              // Stock will be released via cart expiration cleanup if product was deleted
              logError('cart GET: failed to release stock for removed item', error);
            }
          }
        }
        continue;
      }

      let itemQuantity = item.quantity;
      let itemPrice = item.price;
      let itemSubtotal = item.subtotal;

      // Verify stock availability before including item in validated cart
      // Prevents displaying out-of-stock items to users
      if (product.inventory.trackQuantity) {
        const availableQuantity = Math.max(0, product.inventory.quantity - product.inventory.reservedQuantity);
        // Adjust quantity if more than available (unless backorder allowed)
        if (availableQuantity < item.quantity && !product.inventory.allowBackorder) {
          cartNeedsUpdate = true;
          // Reduce quantity to available amount
          itemQuantity = availableQuantity;
          itemSubtotal = itemPrice * availableQuantity;
          // Release excess reserved stock
          if (availableQuantity > 0) {
            try {
              const { releaseReservedStock } = await import('@/lib/inventory/inventory-service');
              await releaseReservedStock(
                item.productId.toString(),
                item.quantity - availableQuantity,
                user?.userId
              );
            } catch (error) {
              logError('cart GET: failed to release excess stock', error);
            }
          } else {
            // Item is out of stock - remove it
            try {
              const { releaseReservedStock } = await import('@/lib/inventory/inventory-service');
              await releaseReservedStock(
                item.productId.toString(),
                item.quantity,
                user?.userId
              );
            } catch (error) {
              logError('cart GET: failed to release stock for out of stock item', error);
            }
            continue;
          }
        }
      }

      // Update price if changed significantly (allow configured variance threshold to avoid frequent updates)
      // E-commerce best practice: Update prices to reflect current product pricing
      const priceVariance = Math.abs(product.price - item.price) / item.price;
      if (priceVariance > (ecommerce.priceVarianceThreshold ?? ECOMMERCE.priceVarianceThreshold)) {
        cartNeedsUpdate = true;
        itemPrice = product.price;
        itemSubtotal = product.price * itemQuantity;
      }

      // Update product metadata (SKU, title, image) if changed to keep cart synchronized
      // Ensures cart displays current product information
      const itemSku = item.sku !== product.sku ? product.sku : item.sku;
      const itemTitle = item.title !== product.title ? product.title : item.title;
      const newImage = product.primaryImage || product.images[0] || '';
      const itemImage = item.image !== newImage ? newImage : item.image;

      if (item.sku !== itemSku || item.title !== itemTitle || item.image !== itemImage) {
        cartNeedsUpdate = true;
      }

      validItems.push({
        productId: item.productId,
        sku: itemSku,
        title: itemTitle,
        image: itemImage,
        price: itemPrice,
        quantity: itemQuantity,
        subtotal: itemSubtotal,
      });
    }

    // Persist cart changes if items were removed or modified during validation
    // Ensures cart state reflects current product availability and pricing
    if (cartNeedsUpdate) {
      // Load cart as document (not lean) to save changes
      // Optimize: Only select fields needed for cart update and response
      const cartDoc = await Cart.findById(cart._id)
        .select('items subtotal tax shipping discount total currency');
      if (cartDoc) {
        cartDoc.items = validItems;
        const freeShippingThreshold = ecommerce.freeShippingThreshold ?? ECOMMERCE.freeShippingThreshold;
        const defaultShippingCost = ecommerce.defaultShippingCost ?? ECOMMERCE.defaultShippingCost;
        cartDoc.calculateTotals(freeShippingThreshold, defaultShippingCost);
        const calculateTax = ecommerce.calculateTax ?? ECOMMERCE.calculateTax;
        const taxRate = ecommerce.taxRate ?? ECOMMERCE.taxRate;
        if (calculateTax && taxRate > 0) {
          cartDoc.tax = Math.round(cartDoc.subtotal * taxRate * 100) / 100;
          cartDoc.calculateTotals(freeShippingThreshold, defaultShippingCost);
        }
        await cartDoc.save();
        // Use updated cart document for response to ensure consistency
        cart = cartDoc.toObject();
      }
    }

    // Transform MongoDB document to API response format
    // Excludes internal fields (_id, __v) and converts ObjectIds to strings for JSON serialization
    const cartResponse = {
      id: cart._id.toString(),
      items: (cartNeedsUpdate ? validItems : cart.items).map((item) => ({
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
    };

    const responseData: GetCartResponse = { cart: cartResponse };
    return createSecureResponse(responseData, 200, request);
  } catch (error) {
    logError('cart GET API', error);
    return createSecureErrorResponse('Failed to retrieve cart', 500, request);
  }
}

/**
 * POST /api/cart
 * Add item to cart
 */
export async function POST(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  // Higher limit for cart operations - 200 requests per 15 minutes
  // Cart operations are frequent during shopping, so we allow more requests
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.CART,
    requireContentType: true,
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    // Get e-commerce settings once for use throughout the function
    const ecommerce = await getEcommerceSettings();

    // Validate request body to prevent invalid data from reaching database
    const body = await request.json() as AddToCartRequest;
    const validatedData = addToCartSchema.parse(body);

    // Sanitize productId to prevent injection attacks
    const { validateObjectIdParam } = await import('@/lib/utils/api-helpers');
    const validationResult = await validateObjectIdParam(validatedData.productId, 'product ID', request);
    if ('error' in validationResult) {
      return validationResult.error;
    }
    const productId = validationResult.value;

    // Fetch product with only required fields for validation to reduce data transfer
    // Verifies product exists, is active, and has sufficient stock before adding to cart
    const product = await Product.findById(productId)
      .select('status inventory.quantity inventory.reservedQuantity inventory.trackQuantity inventory.allowBackorder sku title primaryImage images price')
      .lean();
    if (!product) {
      return createSecureErrorResponse('Product not found', 404, request);
    }

    if (product.status !== 'active') {
      return createSecureErrorResponse('Product is no longer available', 400, request);
    }

    // Prevent overselling by checking available stock before allowing item addition
    // Allows backorder if configured, otherwise blocks out-of-stock additions
    if (product.inventory.trackQuantity) {
      const availableQuantity = Math.max(0, product.inventory.quantity - product.inventory.reservedQuantity);
      if (availableQuantity < validatedData.quantity && !product.inventory.allowBackorder) {
        return createSecureErrorResponse(`Only ${availableQuantity} items available in stock`, 400, request);
      }
    }

    // Support both authenticated users (persistent carts) and guest sessions (temporary carts)
    const user = await optionalAuth(request);
    const sessionId = getSessionId(request);

    // Fetch cart as Mongoose document (not lean) since we need to call methods and save
    // Must be a document instance to use calculateTotals() and save() methods
    let cart = await Cart.findOne(
      user ? { userId: user.userId } : { sessionId }
    );

    if (!cart) {
      // Initialize new cart with default currency from database settings
      // Ensures consistent currency across all cart operations
      // E-commerce best practice: Guest carts expire (30 days), user carts don't expire
      cart = new Cart({
        userId: user?.userId,
        sessionId: user ? undefined : sessionId,
        items: [],
        currency: ecommerce.currency ?? ECOMMERCE.currency,
        // Only set expiresAt for guest carts (sessionId-based)
        // User carts (userId-based) should not expire
        expiresAt: user ? undefined : new Date(Date.now() + (ecommerce.guestCartExpirationDays ?? ECOMMERCE.guestCartExpirationDays) * 24 * 60 * 60 * 1000),
      });
    }

    // E-commerce best practice: Enforce maximum cart items limit
    // Prevents cart bloat and ensures reasonable cart sizes
    const maxCartItems = ecommerce.maxCartItems ?? ECOMMERCE.maxCartItems;
    if (cart.items.length >= maxCartItems) {
      return createSecureErrorResponse(
        `Cart cannot exceed ${maxCartItems} items. Please remove some items before adding more.`,
        400,
        request
      );
    }

    // Check for existing cart item to update quantity instead of creating duplicates
    // Prevents multiple cart entries for the same product
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    const quantityToReserve = validatedData.quantity;

    if (existingItemIndex >= 0) {
      // Increment quantity for existing item
      // E-commerce best practice: Update price to current product price if changed significantly
      // Maintains price consistency while allowing minor price fluctuations
      const priceVariance = Math.abs(product.price - cart.items[existingItemIndex].price) / cart.items[existingItemIndex].price;
      if (priceVariance > ECOMMERCE.priceVarianceThreshold) {
        // Price changed significantly - update to current price
        cart.items[existingItemIndex].price = product.price;
        cart.items[existingItemIndex].sku = product.sku;
        cart.items[existingItemIndex].title = product.title;
        const newImage = product.primaryImage || product.images[0] || '';
        if (cart.items[existingItemIndex].image !== newImage) {
          cart.items[existingItemIndex].image = newImage;
        }
      }
      
      const newQuantity = cart.items[existingItemIndex].quantity + validatedData.quantity;
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].subtotal = cart.items[existingItemIndex].price * newQuantity;
    } else {
      // Add new item to cart with current product price and metadata
      // Ensures cart always reflects current product information
      cart.items.push({
        productId: new mongoose.Types.ObjectId(productId),
        sku: product.sku,
        title: product.title,
        image: product.primaryImage || product.images[0] || '',
        price: product.price,
        quantity: validatedData.quantity,
        subtotal: product.price * validatedData.quantity,
      });
    }

    // E-commerce best practice: Reserve stock when item is added to cart
    // Prevents overselling by reserving inventory atomically
    // Stock is released when item is removed from cart or cart expires
    // Retry logic is handled internally by reserveStockForCart for MongoDB lock timeouts
    if (product.inventory.trackQuantity) {
      const reservationResult = await reserveStockForCart(
        productId,
        quantityToReserve,
        user?.userId
      );

      if (!reservationResult.success) {
        // Rollback cart changes if stock reservation fails
        if (existingItemIndex >= 0) {
          cart.items[existingItemIndex].quantity -= validatedData.quantity;
          cart.items[existingItemIndex].subtotal = cart.items[existingItemIndex].price * cart.items[existingItemIndex].quantity;
        } else {
          cart.items.pop();
        }
        return createSecureErrorResponse(
          reservationResult.error || 'Failed to reserve stock',
          400,
          request
        );
      }
    }

    // Calculate cart totals including tax and shipping
    // E-commerce best practice: Apply free shipping when subtotal meets threshold
    const freeShippingThreshold = ecommerce.freeShippingThreshold ?? ECOMMERCE.freeShippingThreshold;
    const defaultShippingCost = ecommerce.defaultShippingCost ?? ECOMMERCE.defaultShippingCost;
    cart.calculateTotals(freeShippingThreshold, defaultShippingCost);
    
    // Calculate tax based on e-commerce configuration (18% GST in India)
    // Tax calculation is configurable and can be disabled for tax-exempt regions
    const calculateTax = ecommerce.calculateTax ?? ECOMMERCE.calculateTax;
    const taxRate = ecommerce.taxRate ?? ECOMMERCE.taxRate;
    if (calculateTax && taxRate > 0) {
      // Round tax to 2 decimal places for financial precision
      cart.tax = Math.round(cart.subtotal * taxRate * 100) / 100;
      // Recalculate cart totals including tax to ensure accurate final amount
      cart.calculateTotals(freeShippingThreshold, defaultShippingCost);
    }
    
    await cart.save();

    const responseData: AddToCartResponse = {
      success: true,
      message: 'Item added to cart',
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
    const response = createSecureResponse(responseData, 200, request);

    // Set session cookie for guest users to persist cart across browser sessions
    // E-commerce best practice: Enables cart recovery when user returns without requiring authentication
    if (!user) {
      const { TIME_DURATIONS } = await import('@/lib/security/constants');
      response.cookies.set('session-id', sessionId, {
        httpOnly: true,
        secure: (await import('@/lib/utils/env')).isProduction(),
        sameSite: 'strict',
        maxAge: TIME_DURATIONS.THIRTY_DAYS,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    logError('cart POST API', error);
    return createSecureErrorResponse('Failed to add item to cart', 500, request);
  }
}

/**
 * DELETE /api/cart
 * Clear entire cart
 */
export async function DELETE(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  // Higher limit for cart operations - 200 requests per 15 minutes
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.CART,
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    const user = await optionalAuth(request);
    const sessionId = getSessionId(request);

    // Fetch cart as document (not lean) since we need to modify and save
    const cart = await Cart.findOne(
      user ? { userId: user.userId } : { sessionId }
    );

    if (!cart) {
      return createSecureResponse({ success: true, message: 'Cart is already empty' }, 200, request);
    }

    // E-commerce best practice: Release all reserved stock before clearing cart
    // Ensures inventory is available for other customers
    if (cart.items.length > 0) {
      for (const item of cart.items) {
        if (item.productId) {
          const product = await Product.findById(item.productId)
            .select('inventory.trackQuantity')
            .lean();
          
          if (product?.inventory.trackQuantity) {
            await releaseReservedStock(
              item.productId.toString(),
              item.quantity,
              user?.userId
            );
          }
        }
      }
    }

    // Clear items and reset totals
    cart.items = [];
    cart.subtotal = 0;
    cart.tax = 0;
    cart.shipping = 0;
    cart.discount = 0;
    cart.total = 0;
    await cart.save();

    return createSecureResponse({ success: true, message: 'Cart cleared' }, 200, request);
  } catch (error) {
    logError('cart DELETE API', error);
    return createSecureErrorResponse('Failed to clear cart', 500, request);
  }
}
