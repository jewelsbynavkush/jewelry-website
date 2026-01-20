/**
 * Inventory Restock API Route
 * 
 * Handles product restocking:
 * - POST: Restock a product (admin only)
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth/middleware';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { sanitizeString } from '@/lib/security/sanitize';
import { formatZodError } from '@/lib/utils/zod-error';
import { restockProduct, getInventorySummary } from '@/lib/inventory/inventory-service';
import { generateIdempotencyKey } from '@/lib/utils/idempotency';
import { z } from 'zod';
import type { RestockProductRequest, RestockProductResponse, InventoryStatus } from '@/types/api';

/**
 * Schema for restocking product
 */
const restockSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  reason: z.string().max(500).optional(),
  idempotencyKey: z.string().optional(),
});

/**
 * POST /api/inventory/[productId]/restock
 * Restock a product (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  // Apply security (CORS, CSRF, rate limiting)
  // Industry standard: 30 write operations per 15 minutes for admin/inventory modifications
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 30 }, // 30 requests per 15 minutes (industry standard)
    requireContentType: true,
  });
  if (securityResponse) return securityResponse;

  try {
    // Require admin access
    const authResult = await requireAdmin(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { user } = authResult;
    const { productId } = await params;
    const sanitizedProductId = sanitizeString(productId);

    await connectDB();
    
    // Validate ObjectId format using centralized validation utility
    const { isValidObjectId } = await import('@/lib/utils/validation');
    if (!isValidObjectId(sanitizedProductId)) {
      return createSecureErrorResponse('Invalid product ID format', 400, request);
    }

    // Verify product exists before attempting restock
    const productExists = await Product.findById(sanitizedProductId).select('_id').lean();
    if (!productExists) {
      return createSecureErrorResponse('Product not found', 404, request);
    }

    // Parse and validate request body BEFORE starting transaction
    const body = await request.json() as RestockProductRequest;
    const validatedData = restockSchema.parse(body);

    // Generate idempotency key
    const idempotencyKey = validatedData.idempotencyKey || generateIdempotencyKey('restock');

    // Restock product (already has retry logic built in)
    const result = await restockProduct(
      sanitizedProductId,
      validatedData.quantity,
      validatedData.reason,
      user.userId,
      idempotencyKey
    );

    if (!result.success) {
      return createSecureErrorResponse(result.error || 'Failed to restock product', 400, request);
    }

    if (!result.product) {
      return createSecureErrorResponse('Product not found after restock', 500, request);
    }

    // Convert product to inventory status format
    const inventoryStatus = await getInventorySummary(sanitizedProductId);
    if (!inventoryStatus) {
      return createSecureErrorResponse('Failed to retrieve inventory status', 500, request);
    }

    // Ensure inventory status includes required fields for InventoryStatus type
    const product = result.product as { _id: { toString(): string }; sku: string; title: string };
    const inventoryResponse: InventoryStatus = {
      productId: product._id.toString(),
      sku: product.sku,
      title: product.title,
      totalQuantity: inventoryStatus.totalQuantity,
      reservedQuantity: inventoryStatus.reservedQuantity,
      availableQuantity: inventoryStatus.availableQuantity,
      lowStockThreshold: inventoryStatus.lowStockThreshold,
      trackQuantity: inventoryStatus.trackQuantity,
      allowBackorder: inventoryStatus.allowBackorder,
      isLowStock: inventoryStatus.isLowStock,
      isOutOfStock: inventoryStatus.isOutOfStock,
    };

    const responseData: RestockProductResponse = {
      success: true,
      message: 'Product restocked successfully',
      inventory: inventoryResponse,
    };
    return createSecureResponse(responseData, 200, request);
  } catch (error) {
    // Handle Zod validation errors
    const zodError = formatZodError(error);
    if (zodError) {
      return createSecureResponse(zodError, 400, request);
    }

    // Handle Mongoose validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      logError('inventory restock API - validation error', error);
      return createSecureErrorResponse('Validation failed. Please check your input.', 400, request);
    }

    logError('inventory restock API', error);
    return createSecureErrorResponse('Failed to restock product', 500, request);
  }
}
