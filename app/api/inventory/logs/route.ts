/**
 * Inventory Logs API Route
 * 
 * Handles inventory log retrieval:
 * - GET: Get inventory logs (admin only)
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import InventoryLog from '@/models/InventoryLog';
import { requireAdmin } from '@/lib/auth/middleware';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import type { GetInventoryLogsResponse } from '@/types/api';

/**
 * GET /api/inventory/logs
 * Get inventory logs (admin only)
 */
export async function GET(request: NextRequest) {
  // Apply security middleware (CORS, CSRF, rate limiting) before processing request
  // Industry standard: 100 requests per 15 minutes for admin/inventory read endpoints
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes (industry standard)
  });
  if (securityResponse) return securityResponse;

  try {
    // Verify admin access - inventory logs contain sensitive business data
    const authResult = await requireAdmin(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const orderId = searchParams.get('orderId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    const skip = (page - 1) * limit;

    // Build MongoDB query with optional filters for product, order, or log type
    const query: Record<string, unknown> = {};
    if (productId) {
      query.productId = productId;
    }
    if (orderId) {
      query.orderId = orderId;
    }
    if (type) {
      query.type = type;
    }

    // Fetch logs with populated references for product, order, and user details
    const logs = await InventoryLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('productId', 'sku title')
      .populate('orderId', 'orderNumber')
      .populate('userId', 'mobile firstName lastName')
      .lean();

    const total = await InventoryLog.countDocuments(query);

    const responseData: GetInventoryLogsResponse = {
      logs: logs.map((log) => ({
        id: log._id.toString(),
        productId: log.productId ? (typeof log.productId === 'object' && '_id' in log.productId ? log.productId._id.toString() : String(log.productId)) : null,
        productSku: log.productSku,
        productTitle: log.productTitle,
        type: log.type,
        quantity: log.quantity,
        previousQuantity: log.previousQuantity,
        newQuantity: log.newQuantity,
        reason: log.reason,
        notes: log.notes,
        orderId: log.orderId ? (typeof log.orderId === 'object' && '_id' in log.orderId ? log.orderId._id.toString() : String(log.orderId)) : null,
        userId: log.userId ? (typeof log.userId === 'object' && '_id' in log.userId ? log.userId._id.toString() : String(log.userId)) : null,
        performedBy: log.performedBy 
          ? (typeof log.performedBy === 'object' 
            ? (log.performedBy.userId 
              ? (typeof log.performedBy.userId === 'object' && '_id' in log.performedBy.userId 
                ? log.performedBy.userId._id.toString() 
                : String(log.performedBy.userId))
              : log.performedBy.name || log.performedBy.type || 'system')
            : String(log.performedBy))
          : undefined,
        createdAt: log.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    const response = createSecureResponse(responseData, 200, request);
    
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return response;
  } catch (error) {
    logError('inventory logs GET API', error);
    return createSecureErrorResponse('Failed to retrieve inventory logs', 500, request);
  }
}
