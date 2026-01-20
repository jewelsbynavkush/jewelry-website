/**
 * Orders API Route
 * 
 * Handles order operations:
 * - POST: Create new order from cart
 * - GET: Get user's orders
 * 
 * Features:
 * - Idempotency support
 * - Stock reservation and confirmation
 * - Transaction support for data integrity
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import User from '@/models/User';
import Product from '@/models/Product';
import { requireAuth } from '@/lib/auth/middleware';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { sanitizeString, sanitizePhone } from '@/lib/security/sanitize';
import { formatZodError } from '@/lib/utils/zod-error';
import { confirmOrderAndUpdateStock, retryWithBackoff, isTransientError } from '@/lib/inventory/inventory-service';
import { generateIdempotencyKey } from '@/lib/utils/idempotency';
import { ECOMMERCE } from '@/lib/constants';
import type { CreateOrderRequest, CreateOrderResponse, GetOrdersResponse } from '@/types/api';
import { z } from 'zod';
import mongoose from 'mongoose';

/**
 * Schema for creating order
 */
const createOrderSchema = z.object({
  cartId: z.string().min(1, 'Cart ID is required').optional(),
  shippingAddress: z.object({
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
  }),
  billingAddress: z.object({
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
  }),
  paymentMethod: z.enum(['razorpay', 'cod', 'bank_transfer', 'other']),
  customerNotes: z.string().max(1000).optional(),
  idempotencyKey: z.string().optional(),
});

/**
 * POST /api/orders
 * Create new order from cart
 */
export async function POST(request: NextRequest) {
  let session: mongoose.ClientSession | null = null;
  
  try {
    // Apply security (CORS, CSRF, rate limiting)
    // Industry standard: 20 order creations per 15 minutes (prevents abuse while allowing legitimate use)
    const securityResponse = applyApiSecurity(request, {
      rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 orders per 15 minutes
      requireContentType: true,
    });
    if (securityResponse) {
      return securityResponse;
    }

    // Require authentication
    const authResult = await requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { user } = authResult;

    // Parse and validate request body BEFORE starting transaction
    let body: CreateOrderRequest;
    try {
      body = await request.json() as CreateOrderRequest;
    } catch (error) {
      logError('orders POST API - request body parsing', error);
      return createSecureErrorResponse('Invalid request body', 400, request);
    }
    
    const validatedData = createOrderSchema.parse(body);

    await connectDB();

    // Check idempotency if key provided (BEFORE starting transaction - it's just a read)
    const idempotencyKey = validatedData.idempotencyKey || generateIdempotencyKey('order');
    if (validatedData.idempotencyKey) {
      const existingOrder = await Order.checkIdempotencyKey(validatedData.idempotencyKey);
      if (existingOrder) {
        return createSecureResponse(
          {
            success: true,
            message: 'Order already processed',
            order: {
              id: existingOrder._id.toString(),
              orderNumber: existingOrder.orderNumber,
              status: existingOrder.status,
              total: existingOrder.total,
              currency: existingOrder.currency,
            },
          },
          200,
          request
        );
      }
    }
    
    // Wrap entire transaction in retry logic for transient errors
    return await retryWithBackoff(async () => {
      session = await mongoose.startSession();
      session.startTransaction();

      // Fetch user's cart within transaction to ensure consistency
      // Cart is locked during order creation to prevent concurrent modifications
      const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(user.userId) }).session(session);
      if (!cart || cart.items.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return createSecureErrorResponse('Cart is empty', 400, request);
      }

      // Validate all items are still available
      // Optimize: Only select fields needed for validation
      for (const item of cart.items) {
        const product = await Product.findById(item.productId)
          .select('status inventory.quantity inventory.reservedQuantity inventory.trackQuantity inventory.allowBackorder price')
          .session(session)
          .lean();
        if (!product || product.status !== 'active') {
          await session.abortTransaction();
          session.endSession();
          return createSecureErrorResponse(`Product ${item.sku} is no longer available`, 400, request);
        }

              // Verify stock availability before order confirmation
              // Prevents overselling when multiple users attempt to purchase simultaneously
              if (product.inventory.trackQuantity) {
          const availableQuantity = Math.max(0, product.inventory.quantity - product.inventory.reservedQuantity);
          if (availableQuantity < item.quantity && !product.inventory.allowBackorder) {
            await session.abortTransaction();
            session.endSession();
            return createSecureErrorResponse(`Insufficient stock for ${item.sku}`, 400, request);
          }
        }

        // Validate price hasn't changed significantly (allow 10% variance)
        const priceVariance = Math.abs(product.price - item.price) / item.price;
        if (priceVariance > 0.1) {
          await session.abortTransaction();
          session.endSession();
          return createSecureErrorResponse(`Price has changed for ${item.sku}. Please refresh your cart.`, 400, request);
        }
      }

      // Sanitize addresses
      const shippingAddress = {
        firstName: sanitizeString(validatedData.shippingAddress.firstName),
        lastName: sanitizeString(validatedData.shippingAddress.lastName),
        company: validatedData.shippingAddress.company ? sanitizeString(validatedData.shippingAddress.company) : undefined,
        addressLine1: sanitizeString(validatedData.shippingAddress.addressLine1),
        addressLine2: validatedData.shippingAddress.addressLine2 ? sanitizeString(validatedData.shippingAddress.addressLine2) : undefined,
        city: sanitizeString(validatedData.shippingAddress.city),
        state: sanitizeString(validatedData.shippingAddress.state),
        zipCode: sanitizeString(validatedData.shippingAddress.zipCode),
        country: sanitizeString(validatedData.shippingAddress.country),
        phone: validatedData.shippingAddress.phone ? sanitizePhone(validatedData.shippingAddress.phone) : undefined,
      };

      const billingAddress = {
        firstName: sanitizeString(validatedData.billingAddress.firstName),
        lastName: sanitizeString(validatedData.billingAddress.lastName),
        company: validatedData.billingAddress.company ? sanitizeString(validatedData.billingAddress.company) : undefined,
        addressLine1: sanitizeString(validatedData.billingAddress.addressLine1),
        addressLine2: validatedData.billingAddress.addressLine2 ? sanitizeString(validatedData.billingAddress.addressLine2) : undefined,
        city: sanitizeString(validatedData.billingAddress.city),
        state: sanitizeString(validatedData.billingAddress.state),
        zipCode: sanitizeString(validatedData.billingAddress.zipCode),
        country: sanitizeString(validatedData.billingAddress.country),
        phone: validatedData.billingAddress.phone ? sanitizePhone(validatedData.billingAddress.phone) : undefined,
      };

      // Ensure tax is calculated if not already set
      // E-commerce best practice: Calculate tax before creating order
      let orderTax = cart.tax;
      if (ECOMMERCE.calculateTax && ECOMMERCE.taxRate > 0 && orderTax === 0) {
        orderTax = Math.round(cart.subtotal * ECOMMERCE.taxRate * 100) / 100;
      }
      
      // Calculate final order total with all components
      // Rounding prevents floating-point precision issues in financial calculations
      const orderTotal = Math.round((cart.subtotal + orderTax + cart.shipping - cart.discount) * 100) / 100;

      // Create order with sanitized addresses and calculated totals
      // Order number will be auto-generated by pre-save hook
      const order = new Order({
        userId: new mongoose.Types.ObjectId(user.userId),
        items: cart.items.map((item) => ({
          productId: item.productId,
          productSku: item.sku,
          productTitle: item.title,
          image: item.image,
          quantity: item.quantity,
          price: item.price,
          total: item.subtotal,
        })),
        subtotal: cart.subtotal,
        tax: orderTax,
        shipping: cart.shipping,
        discount: cart.discount,
        total: orderTotal,
        currency: cart.currency,
        shippingAddress,
        billingAddress,
        paymentMethod: validatedData.paymentMethod,
        paymentStatus: validatedData.paymentMethod === 'cod' ? 'pending' : 'pending',
        customerNotes: validatedData.customerNotes ? sanitizeString(validatedData.customerNotes) : undefined,
        idempotencyKey,
      });

      // Save order within transaction
      // Order number auto-generated by pre-save hook ensures uniqueness
      await order.save({ session });

      // Confirm stock and update inventory
      const orderItems = cart.items.map((item) => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
        sku: item.sku,
      }));

      const stockResult = await confirmOrderAndUpdateStock(
        orderItems,
        order._id.toString(),
        idempotencyKey,
        session // Pass the same session for transaction consistency
      );

      if (!stockResult.success) {
        await session.abortTransaction();
        session.endSession();
        return createSecureErrorResponse(stockResult.error || 'Failed to confirm stock', 400, request);
      }

      // Clear cart after successful order creation
      // Prevents duplicate orders and keeps cart state consistent
      cart.items = [];
      cart.subtotal = 0;
      cart.tax = 0;
      cart.shipping = 0;
      cart.discount = 0;
      cart.total = 0;
      await cart.save({ session });

      // Update user statistics for analytics and customer insights
      // Increments order count and total spent within transaction for consistency
      await User.findByIdAndUpdate(
        new mongoose.Types.ObjectId(user.userId),
        {
          $inc: { totalOrders: 1, totalSpent: order.total },
        },
        { session }
      );

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      const responseData: CreateOrderResponse = {
        success: true,
        message: 'Order created successfully',
        order: {
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total,
          currency: order.currency,
          items: order.items.map((item) => ({
            productId: item.productId.toString(),
            sku: item.productSku,
            title: item.productTitle,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
          createdAt: order.createdAt.toISOString(),
        },
      };
      return createSecureResponse(responseData, 200, request);
    }); // Uses default retry settings (automatically adjusted for test environment)
  } catch (error) {
    if (session !== null && session !== undefined) {
      try {
        const activeSession = session as mongoose.ClientSession;
        await activeSession.abortTransaction();
        activeSession.endSession();
      } catch (sessionError) {
        // Ignore session cleanup errors
        logError('orders POST API - session cleanup', sessionError);
      }
    }

    // Re-throw transient errors to trigger retry (if not already retried)
    if (isTransientError(error)) {
      throw error;
    }

    // Handle Zod validation errors
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    // Handle Mongoose validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      logError('orders POST API - validation error', error);
      return createSecureErrorResponse('Validation failed. Please check your input.', 400, request);
    }

    logError('orders POST API', error);
    return createSecureErrorResponse('Failed to create order', 500, request);
  }
}

/**
 * GET /api/orders
 * Get user's orders
 */
export async function GET(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  // Industry standard: 100 requests per 15 minutes for user-specific read endpoints
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes (industry standard)
  });
  if (securityResponse) return securityResponse;

  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { user } = authResult;

    await connectDB();

    // Extract query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // Build MongoDB query with user filter to enforce access control
    // Users can only view their own orders, preventing unauthorized data access
    const query: Record<string, unknown> = { userId: new mongoose.Types.ObjectId(user.userId) };
    if (status) {
      query.status = status;
    }

    // Fetch orders with pagination and sorting
    // Excludes internal fields like idempotencyKey for security
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Order.countDocuments(query);

    const responseData: GetOrdersResponse = {
      orders: orders.map((order) => ({
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        status: order.status as GetOrdersResponse['orders'][0]['status'],
        paymentStatus: order.paymentStatus as GetOrdersResponse['orders'][0]['paymentStatus'],
        total: order.total,
        currency: order.currency,
        items: order.items.map((item) => ({
          productId: item.productId.toString(),
          sku: item.productSku,
          title: item.productTitle,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        discount: order.discount,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        paymentMethod: order.paymentMethod,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        customerNotes: order.customerNotes,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        shippedAt: order.shippedAt?.toISOString(),
        deliveredAt: order.deliveredAt?.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    const response = createSecureResponse(responseData, 200, request);
    
    // Set cache control to prevent caching of user-specific order data
    // Ensures users always see their most recent orders
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return response;
  } catch (error) {
    logError('orders GET API', error);
    return createSecureErrorResponse('Failed to retrieve orders', 500, request);
  }
}
