/**
 * Order Detail API Route
 * 
 * Handles individual order operations:
 * - GET: Get order details
 * - PATCH: Update order status (admin only)
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAuth, requireAdmin } from '@/lib/auth/middleware';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { sanitizeString } from '@/lib/security/sanitize';
import { formatZodError } from '@/lib/utils/zod-error';
import type { GetOrderResponse } from '@/types/api';
import { z } from 'zod';

/**
 * Schema for updating order status
 */
const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded', 'partially_refunded']).optional(),
  trackingNumber: z.string().max(100).optional(),
  carrier: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

/**
 * GET /api/orders/[orderId]
 * Get order details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  // Apply security (CORS, CSRF, rate limiting)
  // Industry standard: 100 requests per 15 minutes for user-specific read endpoints
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes (industry standard)
  });
  if (securityResponse) return securityResponse;

  try {
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

    // Fetch order with user filter to enforce access control
    // Users can only access their own orders, preventing unauthorized data access
    const order = await Order.findOne({
      _id: sanitizedOrderId,
      userId: user.userId,
    }).lean();

    if (!order) {
      // Check if order exists but belongs to another user
      // Returns generic "not found" to prevent information disclosure about other users' orders
      // Optimize: Only check userId field
      const orderExists = await Order.findById(sanitizedOrderId).select('userId').lean();
      if (orderExists) {
        return createSecureErrorResponse('Order not found', 404, request);
      }
      return createSecureErrorResponse('Order not found', 404, request);
    }

    const responseData: GetOrderResponse = {
      order: {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        status: order.status as GetOrderResponse['order']['status'],
        paymentStatus: order.paymentStatus as GetOrderResponse['order']['paymentStatus'],
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
      },
    };
    const response = createSecureResponse(responseData, 200, request);
    
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return response;
  } catch (error) {
    logError('order GET API', error);
    return createSecureErrorResponse('Failed to retrieve order', 500, request);
  }
}

/**
 * PATCH /api/orders/[orderId]
 * Update order status (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  // Apply security (CORS, CSRF, rate limiting)
  // Industry standard: 50 write operations per 15 minutes for order updates
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 50 }, // 50 requests per 15 minutes (industry standard)
    requireContentType: true,
  });
  if (securityResponse) return securityResponse;

  try {
    // Require admin access
    const authResult = await requireAdmin(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { orderId } = await params;
    const sanitizedOrderId = sanitizeString(orderId);

    await connectDB();
    
    // Validate ObjectId format using centralized validation utility
    const { isValidObjectId } = await import('@/lib/utils/validation');
    if (!isValidObjectId(sanitizedOrderId)) {
      return createSecureErrorResponse('Invalid order ID format', 400, request);
    }

    const body = await request.json();
    const validatedData = updateOrderSchema.parse(body);

    // Fetch order for admin status update
    // Admin-only endpoint allows status changes for order management
    const order = await Order.findById(sanitizedOrderId);
    if (!order) {
      return createSecureErrorResponse('Order not found', 404, request);
    }

    // Update order status and set corresponding timestamps
    // Timestamps track order lifecycle for analytics and customer communication
    if (validatedData.status) {
      order.status = validatedData.status;
      
      // Set timestamps when order transitions to shipped/delivered
      // Only set if not already set to preserve original timestamp
      if (validatedData.status === 'shipped' && !order.shippedAt) {
        order.shippedAt = new Date();
      }
      if (validatedData.status === 'delivered' && !order.deliveredAt) {
        order.deliveredAt = new Date();
      }
    }

    if (validatedData.paymentStatus) {
      order.paymentStatus = validatedData.paymentStatus;
    }

    if (validatedData.trackingNumber !== undefined) {
      order.trackingNumber = validatedData.trackingNumber ? sanitizeString(validatedData.trackingNumber) : undefined;
    }

    if (validatedData.carrier !== undefined) {
      order.carrier = validatedData.carrier ? sanitizeString(validatedData.carrier) : undefined;
    }

    if (validatedData.notes !== undefined) {
      order.notes = validatedData.notes ? sanitizeString(validatedData.notes) : undefined;
    }

    await order.save();

    return createSecureResponse(
      {
        success: true,
        message: 'Order updated successfully',
        order: {
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          trackingNumber: order.trackingNumber,
          carrier: order.carrier,
        },
      },
      200,
      request
    );
  } catch (error) {
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    logError('order PATCH API', error);
    return createSecureErrorResponse('Failed to update order', 500, request);
  }
}
