/**
 * Inventory Status API Route
 * 
 * Handles inventory status retrieval:
 * - GET: Get inventory status for a product
 * 
 * Optional admin feature for inventory management
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { SECURITY_CONFIG } from '@/lib/security/constants';
import { getInventorySummary } from '@/lib/inventory/inventory-service';
import type { GetInventoryStatusResponse, InventoryStatus } from '@/types/api';

/**
 * GET /api/inventory/[productId]
 * Get inventory status for a product
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  // Apply security (CORS, CSRF, rate limiting)
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.INVENTORY_READ,
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    const { productId } = await params;
    const { validateObjectIdParam } = await import('@/lib/utils/api-helpers');
    const validationResult = await validateObjectIdParam(productId, 'product ID', request);
    if ('error' in validationResult) {
      return validationResult.error;
    }
    const sanitizedProductId = validationResult.value;

    // Fetch comprehensive inventory summary including available, reserved, and total quantities
    const inventorySummary = await getInventorySummary(sanitizedProductId);

    if (!inventorySummary) {
      return createSecureErrorResponse('Product not found', 404, request);
    }

    // Fetch minimal product metadata for inventory status response
    // Performance: Select only required fields (SKU, title) to minimize data transfer
    // Optimize: Select only necessary fields for inventory status
    const product = await Product.findById(sanitizedProductId)
      .select('_id sku title inventory.quantity inventory.reservedQuantity inventory.trackQuantity inventory.allowBackorder status')
      .lean();
    if (!product) {
      return createSecureErrorResponse('Product not found', 404, request);
    }

    const inventoryResponse: InventoryStatus = {
      productId: product._id.toString(),
      sku: product.sku,
      title: product.title,
      totalQuantity: inventorySummary.totalQuantity,
      reservedQuantity: inventorySummary.reservedQuantity,
      availableQuantity: inventorySummary.availableQuantity,
      lowStockThreshold: inventorySummary.lowStockThreshold,
      trackQuantity: inventorySummary.trackQuantity,
      allowBackorder: inventorySummary.allowBackorder,
      isLowStock: inventorySummary.isLowStock,
      isOutOfStock: inventorySummary.isOutOfStock,
    };

    const responseData: GetInventoryStatusResponse = {
      inventory: inventoryResponse,
    };
    const response = createSecureResponse(responseData, 200, request);
    
    response.headers.set('Cache-Control', 'private, s-maxage=60, stale-while-revalidate=300');
    return response;
  } catch (error) {
    logError('inventory GET API', error);
    return createSecureErrorResponse('Failed to retrieve inventory status', 500, request);
  }
}
