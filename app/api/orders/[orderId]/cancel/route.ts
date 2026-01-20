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
import { z } from 'zod';
import mongoose from 'mongoose';

/**
 * Schema for canceling order
 */
const cancelOrderSchema = z.object({
  reason: z.string().max(500).optional(),
  idempotencyKey: z.string().optional(),
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
    // Industry standard: 10 cancel operations per 15 minutes (sensitive operation)
    const securityResponse = applyApiSecurity(request, {
      rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 10 requests per 15 minutes (industry standard)
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
    const sanitizedOrderId = sanitizeString(orderId);

    await connectDB();
    
    // Validate ObjectId format using centralized validation utility
    const { isValidObjectId } = await import('@/lib/utils/validation');
    if (!isValidObjectId(sanitizedOrderId)) {
      return createSecureErrorResponse('Invalid order ID format', 400, request);
    }

    // Parse and validate request body BEFORE starting transaction
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
        // Return previous result even if order is now cancelled (idempotent operation)
        return createSecureResponse(
          {
            success: true,
            message: 'Order cancellation already processed',
            order: {
              id: existingOrder._id.toString(),
              orderNumber: existingOrder.orderNumber,
              status: existingOrder.status,
              cancelledAt: existingOrder.cancelledAt,
            },
          },
          200,
          request
        );
      }
    }
    
    // Wrap entire transaction in retry logic for transient errors
    // Uses default retry settings (automatically adjusted for test environment)
    return await retryWithBackoff(async () => {
      const session = await mongoose.startSession();
      session.startTransaction();

      // Fetch order within transaction to ensure consistency during cancellation
      const order = await Order.findById(sanitizedOrderId).session(session);
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

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      return createSecureResponse(
        {
          success: true,
          message: 'Order cancelled successfully',
          order: {
            id: order._id.toString(),
            orderNumber: order.orderNumber,
            status: order.status,
            cancelledAt: order.cancelledAt,
          },
        },
        200,
        request
      );
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
