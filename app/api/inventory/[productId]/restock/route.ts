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
import { formatZodError } from '@/lib/utils/zod-error';
import { restockProduct, getInventorySummary } from '@/lib/inventory/inventory-service';
import { generateIdempotencyKey } from '@/lib/utils/idempotency';
import { SECURITY_CONFIG } from '@/lib/security/constants';
import { z } from 'zod';
import type { RestockProductRequest, RestockProductResponse, InventoryStatus } from '@/types/api';

/**
 * Schema for restocking product with industry-standard validation
 */
const restockSchema = z.object({
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(10000, 'Quantity cannot exceed 10,000'),
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
 * POST /api/inventory/[productId]/restock
 * Restock a product (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  // Apply security (CORS, CSRF, rate limiting)
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.INVENTORY_WRITE,
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

    await connectDB();
    
    // Validate ObjectId format using centralized validation utility
    const { validateObjectIdParam } = await import('@/lib/utils/api-helpers');
    const validationResult = await validateObjectIdParam(productId, 'product ID', request);
    if ('error' in validationResult) {
      return validationResult.error;
    }
    const sanitizedProductId = validationResult.value;

    // Verify product exists before attempting restock
    const productExists = await Product.findById(sanitizedProductId).select('_id').lean();
    if (!productExists) {
      return createSecureErrorResponse('Product not found', 404, request);
    }

    // Validate restock data BEFORE starting transaction to avoid unnecessary DB operations
    // Transaction overhead is expensive, so fail fast on invalid input
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

    // Transform product document to InventoryStatus response format
    // Includes available, reserved, and total quantities for inventory management
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
