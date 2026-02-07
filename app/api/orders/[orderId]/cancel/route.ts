/**
 * Cancel Order API Route
 * 
 * Handles order cancellation:
 * - POST: Cancel order and restore stock
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAuth } from '@/lib/auth/middleware';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { sanitizeString } from '@/lib/security/sanitize';
import { formatZodError } from '@/lib/utils/zod-error';
import { cancelOrderAndRestoreStock, retryWithBackoff, isTransientError } from '@/lib/inventory/inventory-service';
import { generateIdempotencyKey } from '@/lib/utils/idempotency';
import { SECURITY_CONFIG } from '@/lib/security/constants';
import type { CancelOrderResponse } from '@/types/api';
import { z } from 'zod';
import mongoose from 'mongoose';

/**
 * Schema for canceling order with industry-standard validation
 */
const cancelOrderSchema = z.object({
  reason: z
    .string()
    .max(500, 'Reason must not exceed 500 characters')
    .trim()
    .optional(),
  idempotencyKey: z
    .string()
    .max(100, 'Idempotency key is too long')
    .optional(),
});

/**
 * POST /api/orders/[orderId]/cancel
 * Cancel order and restore stock
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Apply security (CORS, CSRF, rate limiting)
    const securityResponse = applyApiSecurity(request, {
      rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.ORDER_CANCEL,
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
    const { orderId } = await params;

    await connectDB();
    
    // Validate ObjectId format using centralized validation utility
    const { validateObjectIdParam } = await import('@/lib/utils/api-helpers');
    const validationResult = await validateObjectIdParam(orderId, 'order ID', request);
    if ('error' in validationResult) {
      return validationResult.error;
    }
    const sanitizedOrderId = validationResult.value;

    // Validate request body BEFORE starting transaction to avoid unnecessary DB operations
    // Transaction overhead is expensive, so fail fast on invalid input
    const body = await request.json().catch(() => ({}));
    const validatedData = cancelOrderSchema.parse(body);
    
    // Check idempotency if key provided (BEFORE starting transaction - it's just a read)
    const idempotencyKey = validatedData.idempotencyKey || generateIdempotencyKey('cancel-order');
    if (validatedData.idempotencyKey) {
      const existingOrder = await Order.checkIdempotencyKey(validatedData.idempotencyKey);
      if (existingOrder) {
        // Verify order belongs to user (security check)
        if (existingOrder.userId.toString() !== user.userId) {
          return createSecureErrorResponse('Unauthorized access to order', 403, request);
        }
        // Return previous cancellation result for idempotency
        // Allows safe retry of cancellation requests without side effects
        // Mask sensitive data in response to prevent exposure in network tab
        const orderData = {
          id: existingOrder._id.toString(),
          orderNumber: existingOrder.orderNumber,
          status: existingOrder.status as CancelOrderResponse['order']['status'],
          paymentStatus: existingOrder.paymentStatus as CancelOrderResponse['order']['paymentStatus'],
          items: existingOrder.items.map((item) => ({
            productId: item.productId.toString(),
            sku: item.productSku,
            title: item.productTitle,
            image: item.image,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
          subtotal: existingOrder.subtotal,
          tax: existingOrder.tax,
          shipping: existingOrder.shipping,
          discount: existingOrder.discount,
          total: existingOrder.total,
          currency: existingOrder.currency,
          shippingAddress: existingOrder.shippingAddress,
          billingAddress: existingOrder.billingAddress,
          paymentMethod: existingOrder.paymentMethod,
          trackingNumber: existingOrder.trackingNumber,
          carrier: existingOrder.carrier,
          customerNotes: existingOrder.customerNotes,
          createdAt: existingOrder.createdAt.toISOString(),
          updatedAt: existingOrder.updatedAt.toISOString(),
          shippedAt: existingOrder.shippedAt?.toISOString(),
          deliveredAt: existingOrder.deliveredAt?.toISOString(),
        };
        
        // Send real order data (not masked) - user is authenticated and should see their own orders
        // HTTPS/TLS encrypts the response in transit, preventing network tab exposure
        const idempotentResponseData: CancelOrderResponse = {
          success: true,
          message: 'Order cancellation already processed',
          order: orderData as CancelOrderResponse['order'],
        };
        return createSecureResponse(idempotentResponseData, 200, request);
      }
    }
    
    // Wrap entire transaction in retry logic for transient errors
    // Uses default retry settings (automatically adjusted for test environment)
    return await retryWithBackoff(async () => {
      const session = await mongoose.startSession();
      session.startTransaction();

      // Fetch order within transaction to ensure consistency during cancellation
      // Note: Must select all fields used in response, cannot use .lean() as we need to save
      const order = await Order.findById(sanitizedOrderId)
        .select('userId status paymentStatus items idempotencyKey orderNumber subtotal tax shipping discount total currency shippingAddress billingAddress paymentMethod trackingNumber carrier customerNotes createdAt updatedAt shippedAt deliveredAt cancelledAt cancelledReason')
        .session(session);
      if (!order) {
        await session.abortTransaction();
        session.endSession();
        return createSecureErrorResponse('Order not found', 404, request);
      }

      // Verify order belongs to user
      if (order.userId.toString() !== user.userId) {
        await session.abortTransaction();
        session.endSession();
        return createSecureErrorResponse('Unauthorized access to order', 403, request);
      }

      // Verify order can be cancelled - prevents duplicate cancellations via idempotency
      // Only allows cancellation if order hasn't already been processed
      if (order.status === 'cancelled') {
        await session.abortTransaction();
        session.endSession();
        return createSecureErrorResponse('Order is already cancelled', 400, request);
      }

      if (order.status === 'delivered') {
        await session.abortTransaction();
        session.endSession();
        return createSecureErrorResponse('Cannot cancel delivered order', 400, request);
      }

      // Allow cancellation of paid orders - payment status will be updated to refunded
      // Only prevent cancellation of delivered orders

      // Restore stock
      const orderItems = order.items.map((item) => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
        sku: item.productSku,
      }));

      const stockResult = await cancelOrderAndRestoreStock(
        orderItems,
        order._id.toString(),
        idempotencyKey,
        session // Pass the same session for transaction consistency
      );

      if (!stockResult.success) {
        await session.abortTransaction();
        session.endSession();
        return createSecureErrorResponse(stockResult.error || 'Failed to restore stock', 400, request);
      }

      // Mark order as cancelled and restore inventory
      // Status change triggers inventory restoration in post-save hook
      order.status = 'cancelled';
      order.cancelledAt = new Date();
      order.cancelledReason = validatedData.reason ? sanitizeString(validatedData.reason) : 'Cancelled by user';
      
      // Store idempotency key to prevent duplicate cancellation processing
      // Allows safe retry of cancellation requests without side effects
      if (idempotencyKey && !order.idempotencyKey) {
        order.idempotencyKey = idempotencyKey;
      }

      if (order.paymentStatus === 'paid') {
        order.paymentStatus = 'refunded';
      }

      await order.save({ session });

      // Commit transaction to persist cancellation and stock restoration atomically
      // Ensures order status and inventory are updated together, preventing inconsistent state
      await session.commitTransaction();
      session.endSession();

      // Send real order data (not masked) - user is authenticated and should see their own orders
      // HTTPS/TLS encrypts the response in transit, preventing network tab exposure
      const orderData = {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        status: order.status as CancelOrderResponse['order']['status'],
        paymentStatus: order.paymentStatus as CancelOrderResponse['order']['paymentStatus'],
        items: order.items.map((item) => ({
          productId: item.productId.toString(),
          sku: item.productSku,
          title: item.productTitle,
          image: item.image,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        discount: order.discount,
        total: order.total,
        currency: order.currency,
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
      
      const responseData: CancelOrderResponse = {
        success: true,
        message: 'Order cancelled successfully',
        order: orderData as CancelOrderResponse['order'],
      };
      return createSecureResponse(responseData, 200, request);
      }); // Uses default retry settings (automatically adjusted for test environment)
    } catch (error) {
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
      logError('cancel order API - validation error', error);
      return createSecureErrorResponse('Validation failed. Please check your input.', 400, request);
    }

    logError('cancel order API', error);
    return createSecureErrorResponse('Failed to cancel order', 500, request);
  }
}
