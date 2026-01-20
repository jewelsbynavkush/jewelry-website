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
import { sanitizeString } from '@/lib/security/sanitize';
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
  // Industry standard: 100 requests per 15 minutes for admin/inventory read endpoints
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes (industry standard)
  });
  if (securityResponse) return securityResponse;

  try {
    await connectDB();

    const { productId } = await params;
    const sanitizedProductId = sanitizeString(productId);

    // Fetch comprehensive inventory summary including available, reserved, and total quantities
    const inventorySummary = await getInventorySummary(sanitizedProductId);

    if (!inventorySummary) {
      return createSecureErrorResponse('Product not found', 404, request);
    }

    // Get product to include required fields for InventoryStatus
    const product = await Product.findById(sanitizedProductId).select('_id sku title').lean();
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
