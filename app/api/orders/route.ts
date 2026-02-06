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
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse, checkUserRateLimit } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { sanitizeString, sanitizePhone } from '@/lib/security/sanitize';
import { formatZodError } from '@/lib/utils/zod-error';
import { getPaginationParams } from '@/lib/utils/api-helpers';
import { confirmOrderAndUpdateStock, retryWithBackoff, isTransientError } from '@/lib/inventory/inventory-service';
import { generateIdempotencyKey } from '@/lib/utils/idempotency';
import { ECOMMERCE } from '@/lib/constants';
import { SECURITY_CONFIG } from '@/lib/security/constants';
import type { CreateOrderRequest, CreateOrderResponse, GetOrdersResponse } from '@/types/api';
import { z } from 'zod';
import mongoose from 'mongoose';
import { indianAddressSchema } from '@/lib/validations/address';

/**
 * Schema for creating order with Indian address validation
 */
const createOrderSchema = z.object({
  cartId: z.string().min(1, 'Cart ID is required').max(100).optional(),
  shippingAddress: indianAddressSchema,
  billingAddress: indianAddressSchema,
  paymentMethod: z.enum(['razorpay', 'cod', 'bank_transfer', 'other']),
  customerNotes: z.string().max(1000, 'Customer notes must not exceed 1000 characters').optional(),
  idempotencyKey: z.string().max(100).optional(),
  saveShippingAddress: z.boolean().optional().default(false),
  saveBillingAddress: z.boolean().optional().default(false),
});

/**
 * POST /api/orders
 * Create new order from cart
 */
export async function POST(request: NextRequest) {
  let session: mongoose.ClientSession | null = null;
  
  try {
    // Apply security (CORS, CSRF) - rate limiting done after auth with user ID
    const securityResponse = applyApiSecurity(request, {
      enableRateLimit: false, // Disable IP-based rate limiting, use user-based instead
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

    // Industry standard: Per-user rate limiting for authenticated endpoints
    const { checkUserRateLimit } = await import('@/lib/security/api-security');
    const userRateLimitResponse = checkUserRateLimit(
      request,
      user.userId,
      SECURITY_CONFIG.RATE_LIMIT.ORDER
    );
    if (userRateLimitResponse) return userRateLimitResponse;

    // Validate request body before starting transaction (fail fast to avoid transaction overhead)
    let body: CreateOrderRequest;
    try {
      body = await request.json() as CreateOrderRequest;
    } catch (error) {
      logError('orders POST API - request body parsing', error);
      return createSecureErrorResponse('Invalid request body', 400, request);
    }
    
    const validatedData = createOrderSchema.parse(body);

    await connectDB();

    // Check idempotency before transaction (read-only check, no transaction needed)
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
    
    // Retry transaction on transient MongoDB errors (lock timeouts, write conflicts)
    return await retryWithBackoff(async () => {
      session = await mongoose.startSession();
      session.startTransaction();

      // Validate userId format (defense-in-depth, even though JWT already validates it)
      const { isValidObjectId } = await import('@/lib/utils/validation');
      if (!isValidObjectId(user.userId)) {
        await session.abortTransaction();
        session.endSession();
        return createSecureErrorResponse('Invalid user ID format', 400, request);
      }
      
      // Fetch cart within transaction to lock it and prevent concurrent order creation
      const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(user.userId) })
        .select('items subtotal tax shipping discount total currency')
        .session(session);
      if (!cart || cart.items.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return createSecureErrorResponse('Cart is empty', 400, request);
      }

      // Validate all cart items are still available and in stock
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

        // Prevent overselling by checking available stock before order confirmation
        if (product.inventory.trackQuantity) {
          const availableQuantity = Math.max(0, product.inventory.quantity - product.inventory.reservedQuantity);
          if (availableQuantity < item.quantity && !product.inventory.allowBackorder) {
            await session.abortTransaction();
            session.endSession();
            return createSecureErrorResponse(`Insufficient stock for ${item.sku}`, 400, request);
          }
        }

        // Reject order if price changed significantly (prevents price manipulation)
        const priceVariance = Math.abs(product.price - item.price) / item.price;
        if (priceVariance > ECOMMERCE.priceVarianceThreshold) {
          await session.abortTransaction();
          session.endSession();
          return createSecureErrorResponse(`Price has changed for ${item.sku}. Please refresh your cart.`, 400, request);
        }
      }

      // Sanitize all address fields to prevent XSS attacks
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
        phone: sanitizePhone(validatedData.shippingAddress.phone),
        countryCode: sanitizeString(validatedData.shippingAddress.countryCode || '+91'),
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
        phone: sanitizePhone(validatedData.billingAddress.phone),
        countryCode: sanitizeString(validatedData.billingAddress.countryCode || '+91'),
      };

      // Ensure tax is calculated if not already set
      // E-commerce best practice: Calculate tax before creating order
      let orderTax = cart.tax;
      if (ECOMMERCE.calculateTax && ECOMMERCE.taxRate > 0 && orderTax === 0) {
        orderTax = Math.round(cart.subtotal * ECOMMERCE.taxRate * 100) / 100;
      }
      
      // Calculate final order total including subtotal, tax, shipping, and discount
      // Rounding prevents floating-point precision issues in financial calculations
      const orderTotal = Math.round((cart.subtotal + orderTax + cart.shipping - cart.discount) * 100) / 100;
      
      // E-commerce best practice: Validate order total is positive
      // Prevents creating orders with zero or negative totals
      if (orderTotal <= 0) {
        await session.abortTransaction();
        session.endSession();
        return createSecureErrorResponse('Order total must be greater than zero', 400, request);
      }

      // Create order document with sanitized addresses to prevent XSS
      // Order number auto-generated by pre-save hook ensures uniqueness
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
        paymentStatus: 'pending', // All orders start with pending payment status
        customerNotes: validatedData.customerNotes ? sanitizeString(validatedData.customerNotes) : undefined,
        idempotencyKey,
      });

      // Save order within transaction to ensure atomicity
      // If any part fails, entire order creation is rolled back
      // Order number auto-generated by pre-save hook ensures uniqueness
      await order.save({ session });

      // Convert reserved stock to sold and update inventory atomically
      // Prevents overselling by confirming stock availability within transaction
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

      // Save addresses within transaction to maintain data consistency
      // Only saves new addresses that don't already exist to prevent duplicates
      // Only save new addresses entered in checkout, not already saved addresses
      if (validatedData.saveShippingAddress || validatedData.saveBillingAddress) {
        const userDoc = await User.findById(new mongoose.Types.ObjectId(user.userId))
          .select('addresses defaultShippingAddressId defaultBillingAddressId')
          .session(session);
        
        if (userDoc) {
          // Compare address fields to detect duplicates before saving
          // Prevents duplicate addresses in user's address book by matching all address components
          const addressExists = (addressToCheck: typeof shippingAddress) => {
            return userDoc.addresses.some((addr) => {
              return (
                addr.firstName === addressToCheck.firstName &&
                addr.lastName === addressToCheck.lastName &&
                addr.addressLine1 === addressToCheck.addressLine1 &&
                (addr.addressLine2 || '') === (addressToCheck.addressLine2 || '') &&
                addr.city === addressToCheck.city &&
                addr.state === addressToCheck.state &&
                addr.zipCode === addressToCheck.zipCode &&
                addr.country === addressToCheck.country &&
                addr.phone === addressToCheck.phone &&
                addr.countryCode === addressToCheck.countryCode
              );
            });
          };

          // Save shipping address to user's address book if requested
          // Skips saving if identical address already exists to prevent duplicates
          if (validatedData.saveShippingAddress) {
            if (!addressExists(shippingAddress)) {
              const shippingAddressData = {
                type: 'shipping' as const,
                firstName: shippingAddress.firstName,
                lastName: shippingAddress.lastName,
                addressLine1: shippingAddress.addressLine1,
                addressLine2: shippingAddress.addressLine2,
                city: shippingAddress.city,
                state: shippingAddress.state,
                zipCode: shippingAddress.zipCode,
                country: shippingAddress.country,
                phone: shippingAddress.phone,
                countryCode: shippingAddress.countryCode,
                isDefault: userDoc.addresses.length === 0, // First address becomes default
              };
              userDoc.addAddress(shippingAddressData);
            }
          }
          
          // Save billing address separately if requested and different from shipping
          // Only saves when explicitly requested and shipping address wasn't saved
          if (validatedData.saveBillingAddress && !validatedData.saveShippingAddress) {
            if (!addressExists(billingAddress)) {
              const billingAddressData = {
                type: 'billing' as const,
                firstName: billingAddress.firstName,
                lastName: billingAddress.lastName,
                addressLine1: billingAddress.addressLine1,
                addressLine2: billingAddress.addressLine2,
                city: billingAddress.city,
                state: billingAddress.state,
                zipCode: billingAddress.zipCode,
                country: billingAddress.country,
                phone: billingAddress.phone,
                countryCode: billingAddress.countryCode,
                isDefault: userDoc.addresses.length === 0, // First address becomes default
              };
              userDoc.addAddress(billingAddressData);
            }
          }
          
          await userDoc.save({ session });
        }
      }

      // Update user statistics within transaction for data consistency
      // Tracks customer lifetime value and order frequency for business insights
      await User.findByIdAndUpdate(
        new mongoose.Types.ObjectId(user.userId),
        {
          $inc: { totalOrders: 1, totalSpent: order.total },
        },
        { session }
      );

      // Commit transaction to persist all changes atomically
      // All database operations (order, inventory, cart, addresses, user stats) succeed or fail together
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
  // Apply security (CORS, CSRF) - rate limiting done after auth with user ID
  const securityResponse = applyApiSecurity(request, {
    enableRateLimit: false, // Disable IP-based rate limiting, use user-based instead
  });
  if (securityResponse) return securityResponse;

  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { user } = authResult;

    // Industry standard: Per-user rate limiting for authenticated endpoints
    // 200 requests per 15 minutes (industry standard for user-specific read endpoints)
    const userRateLimitResponse = checkUserRateLimit(
      request,
      user.userId,
      SECURITY_CONFIG.RATE_LIMIT.PUBLIC_BROWSING
    );
    if (userRateLimitResponse) return userRateLimitResponse;

    await connectDB();

    // Extract query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    
    // Validate and sanitize pagination parameters to prevent DoS attacks
    const { limit, page } = getPaginationParams(searchParams);
    const statusParam = searchParams.get('status');

    const skip = (page - 1) * limit;

    // Build MongoDB query with user filter to enforce access control
    // Users can only view their own orders, preventing unauthorized data access
    const query: Record<string, unknown> = { userId: new mongoose.Types.ObjectId(user.userId) };
    
    // Validate status parameter against allowed values (whitelist approach)
    // Prevents injection attacks and ensures only valid status values are used
    if (statusParam) {
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
      const sanitizedStatus = sanitizeString(statusParam);
      if (validStatuses.includes(sanitizedStatus)) {
        query.status = sanitizedStatus;
      }
    }

    // Fetch user's orders with pagination and sorting
    // Excludes sensitive internal fields (idempotencyKey) to prevent information disclosure
    // Optimize: Select only fields needed for order listing response
    const orders = await Order.find(query)
      .select('-idempotencyKey') // Exclude sensitive field
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Order.countDocuments(query);

    // Mask sensitive order data in response to prevent exposure in network tab
    const responseData: GetOrdersResponse = {
      orders: orders.map((order) => {
        const orderData = {
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
        };
        
        // Send real order data (not masked) - user is authenticated and should see their own orders
        // HTTPS/TLS encrypts the response in transit, preventing network tab exposure
        return orderData as GetOrdersResponse['orders'][0];
      }),
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
