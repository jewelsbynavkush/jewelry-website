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
import { sanitizeString } from '@/lib/security/sanitize';
import { formatZodError } from '@/lib/utils/zod-error';
import { ECOMMERCE } from '@/lib/constants';
import type { GetCartResponse, AddToCartRequest, AddToCartResponse } from '@/types/api';
import { z } from 'zod';
import mongoose from 'mongoose';

/**
 * Schema for adding item to cart
 */
const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100'),
});

/**
 * Generate or get session ID for guest carts
 */
function getSessionId(request: NextRequest): string {
  // Try to get from cookie first
  const sessionCookie = request.cookies.get('session-id');
  if (sessionCookie?.value) {
    return sessionCookie.value;
  }

  // Generate new session ID
  const newSessionId = new mongoose.Types.ObjectId().toString();
  return newSessionId;
}

/**
 * GET /api/cart
 * Retrieve user's cart or guest cart
 */
export async function GET(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  // Industry standard: 100 requests per 15 minutes for user-specific endpoints
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes (industry standard)
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    // Try to authenticate (optional for guest carts)
    const user = await optionalAuth(request);
    const sessionId = getSessionId(request);

    let cart;

    if (user) {
      // Authenticated user - get by userId
      cart = await Cart.findOne({ userId: user.userId }).lean();
    } else {
      // Guest user - get by sessionId
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
          currency: ECOMMERCE.currency,
        },
      },
      200,
      request
    );
    }

    // Transform MongoDB document to API response format
    // Excludes internal fields and formats ObjectIds as strings
    const cartResponse = {
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
  // Industry standard: 50 write operations per 15 minutes for cart modifications
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 50 }, // 50 requests per 15 minutes (industry standard)
    requireContentType: true,
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    // Parse and validate request body - ensures productId and quantity are provided and valid
    const body = await request.json() as AddToCartRequest;
    const validatedData = addToCartSchema.parse(body);

    // Sanitize and validate productId
    const productId = sanitizeString(validatedData.productId);
    
    // Validate ObjectId format using centralized validation utility
    const { isValidObjectId } = await import('@/lib/utils/validation');
    if (!isValidObjectId(productId)) {
      return createSecureErrorResponse('Invalid product ID format', 400, request);
    }

    // Fetch product with only required fields for validation to reduce data transfer
    // Verifies product exists, is active, and has sufficient stock before adding to cart
    const product = await Product.findById(productId)
      .select('status inventory.quantity inventory.reservedQuantity inventory.trackQuantity inventory.allowBackorder sku title primaryImage images price')
      .lean();
    if (!product) {
      return createSecureErrorResponse('Product not found', 404, request);
    }

    if (product.status !== 'active') {
      return createSecureErrorResponse('Product is not available', 400, request);
    }

    // Verify stock availability before allowing item addition
    // Prevents adding out-of-stock items unless backorder is allowed
    if (product.inventory.trackQuantity) {
      const availableQuantity = Math.max(0, product.inventory.quantity - product.inventory.reservedQuantity);
      if (availableQuantity < validatedData.quantity && !product.inventory.allowBackorder) {
        return createSecureErrorResponse(`Only ${availableQuantity} items available in stock`, 400, request);
      }
    }

    // Retrieve existing cart or create new one for user/guest session
    // Supports both authenticated users (userId) and guest sessions (sessionId)
    const user = await optionalAuth(request);
    const sessionId = getSessionId(request);

    let cart = await Cart.findOne(
      user ? { userId: user.userId } : { sessionId }
    );

    if (!cart) {
      // Initialize new cart with default currency from constants for consistency
      cart = new Cart({
        userId: user?.userId,
        sessionId: user ? undefined : sessionId,
        items: [],
        currency: ECOMMERCE.currency,
      });
    }

    // Check if product already exists in cart to update quantity instead of creating duplicate entry
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Increment quantity for existing item and recalculate subtotal with current product price
      const newQuantity = cart.items[existingItemIndex].quantity + validatedData.quantity;
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].subtotal = cart.items[existingItemIndex].price * newQuantity;
    } else {
      // Add new item to cart with current product price and metadata
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

    // Calculate totals with free shipping threshold and tax
    // E-commerce best practice: Apply free shipping when subtotal meets threshold
    cart.calculateTotals(ECOMMERCE.freeShippingThreshold, ECOMMERCE.defaultShippingCost);
    
    // Calculate tax if enabled
    if (ECOMMERCE.calculateTax && ECOMMERCE.taxRate > 0) {
      cart.tax = Math.round(cart.subtotal * ECOMMERCE.taxRate * 100) / 100; // Round to 2 decimal places
      cart.calculateTotals(ECOMMERCE.freeShippingThreshold, ECOMMERCE.defaultShippingCost); // Recalculate total with tax
    }
    
    await cart.save();

    // Set session cookie for guest users
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

    // Set session cookie for guest users to maintain cart persistence across sessions
    if (!user) {
      response.cookies.set('session-id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60, // 30 days
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
  // Industry standard: 50 write operations per 15 minutes for cart modifications
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 50 }, // 50 requests per 15 minutes (industry standard)
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    const user = await optionalAuth(request);
    const sessionId = getSessionId(request);

    const cart = await Cart.findOne(
      user ? { userId: user.userId } : { sessionId }
    );

    if (!cart) {
      return createSecureResponse({ success: true, message: 'Cart is already empty' }, 200, request);
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
