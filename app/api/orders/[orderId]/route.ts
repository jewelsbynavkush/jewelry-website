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
import { SECURITY_CONFIG } from '@/lib/security/constants';
import type { GetOrderResponse, UpdateOrderStatusRequest, UpdateOrderStatusResponse } from '@/types/api';
import { z } from 'zod';

/**
 * Schema for updating order status with industry-standard validation
 */
const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded', 'partially_refunded']).optional(),
  trackingNumber: z
    .string()
    .max(100, 'Tracking number must not exceed 100 characters')
    .trim()
    .optional(),
  carrier: z
    .string()
    .max(100, 'Carrier name must not exceed 100 characters')
    .trim()
    .optional(),
  notes: z
    .string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .trim()
    .optional(),
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
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.ORDER_READ,
  });
  if (securityResponse) return securityResponse;

  try {
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

    // Fetch order with user filter to enforce access control
    // Users can only access their own orders, preventing unauthorized data access
    // Optimize: Select only fields needed for order details response
    const order = await Order.findOne({
      _id: sanitizedOrderId,
      userId: user.userId,
    })
      .select('orderNumber status paymentStatus items subtotal tax shipping discount total currency shippingAddress billingAddress paymentMethod trackingNumber carrier customerNotes createdAt updatedAt shippedAt deliveredAt')
      .lean();

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

    // Mask sensitive order data in response to prevent exposure in network tab
    const orderData = {
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
    };
    
    // Send real order data (not masked) - user is authenticated and should see their own orders
    // HTTPS/TLS encrypts the response in transit, preventing network tab exposure
    const responseData: GetOrderResponse = {
      order: orderData as GetOrderResponse['order'],
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
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.AUTH,
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

    await connectDB();
    
    // Validate ObjectId format using centralized validation utility
    const { validateObjectIdParam } = await import('@/lib/utils/api-helpers');
    const validationResult = await validateObjectIdParam(orderId, 'order ID', request);
    if ('error' in validationResult) {
      return validationResult.error;
    }
    const sanitizedOrderId = validationResult.value;

    const body = (await request.json()) as UpdateOrderStatusRequest;
    const validatedData = updateOrderSchema.parse(body);

    // Fetch order for admin status update
    // Admin-only endpoint allows status changes for order management
    // Optimize: Only select fields needed for status update
    const order = await Order.findById(sanitizedOrderId)
      .select('status paymentStatus trackingNumber carrier notes shippedAt deliveredAt');
    if (!order) {
      return createSecureErrorResponse('Order not found', 404, request);
    }

    // Update order status and set corresponding timestamps
    // Timestamps track order lifecycle for analytics and customer communication
    // E-commerce best practice: Validate status transitions to prevent invalid state changes
    if (validatedData.status) {
      const currentStatus = order.status;
      const newStatus = validatedData.status;
      
      // Prevent invalid status transitions
      // Once delivered, cancelled, or refunded, order should not transition to earlier states
      if (currentStatus === 'delivered' && newStatus !== 'delivered' && newStatus !== 'refunded') {
        return createSecureErrorResponse('Cannot change status of delivered order', 400, request);
      }
      if (currentStatus === 'cancelled' && newStatus !== 'cancelled') {
        return createSecureErrorResponse('Cannot change status of cancelled order', 400, request);
      }
      if (currentStatus === 'refunded' && newStatus !== 'refunded') {
        return createSecureErrorResponse('Cannot change status of refunded order', 400, request);
      }
      
      order.status = newStatus;
      
      // Set timestamps when order transitions to shipped/delivered
      // Only set if not already set to preserve original timestamp
      if (newStatus === 'shipped' && !order.shippedAt) {
        order.shippedAt = new Date();
      }
      if (newStatus === 'delivered' && !order.deliveredAt) {
        order.deliveredAt = new Date();
      }
    }

    // E-commerce best practice: Validate payment status transitions
    // Prevent invalid payment status changes (e.g., refunded -> paid)
    if (validatedData.paymentStatus) {
      const currentPaymentStatus = order.paymentStatus;
      const newPaymentStatus = validatedData.paymentStatus;
      
      // Prevent invalid payment status transitions
      // Once refunded, payment status should not change back to paid
      if (currentPaymentStatus === 'refunded' && newPaymentStatus !== 'refunded' && newPaymentStatus !== 'partially_refunded') {
        return createSecureErrorResponse('Cannot change payment status of refunded order', 400, request);
      }
      
      order.paymentStatus = newPaymentStatus;
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

    const payload: UpdateOrderStatusResponse = {
      success: true,
      message: 'Order updated successfully',
      order: {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
      } as UpdateOrderStatusResponse['order'],
    };
    return createSecureResponse(payload, 200, request);
  } catch (error) {
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    logError('order PATCH API', error);
    return createSecureErrorResponse('Failed to update order', 500, request);
  }
}
