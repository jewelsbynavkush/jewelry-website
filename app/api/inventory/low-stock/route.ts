/**
 * Low Stock Alerts API Route
 * 
 * Handles low stock alerts:
 * - GET: Get products with low stock (admin only)
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth/middleware';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import type { GetLowStockResponse, LowStockProduct } from '@/types/api';

/**
 * GET /api/inventory/low-stock
 * Get products with low stock (admin only)
 */
export async function GET(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  // Industry standard: 100 requests per 15 minutes for admin/inventory read endpoints
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes (industry standard)
  });
  if (securityResponse) return securityResponse;

  try {
    // Require admin access
    const authResult = await requireAdmin(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    await connectDB();

    // Extract query parameters for pagination and threshold customization
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Fetch products with stock below threshold for inventory management
    // Only includes active products that track quantity
    const products = await Product.find({
      status: 'active',
      'inventory.trackQuantity': true,
      $expr: {
        $and: [
          {
            $lte: [
              { $subtract: ['$inventory.quantity', '$inventory.reservedQuantity'] },
              '$inventory.lowStockThreshold'
            ]
          },
          {
            $gt: [
              { $subtract: ['$inventory.quantity', '$inventory.reservedQuantity'] },
              0
            ]
          }
        ]
      }
    })
      .select('sku title inventory status')
      .sort({ 'inventory.quantity': 1 })
      .limit(limit)
      .lean();

    // Map products to LowStockProduct format
    const mappedProducts: LowStockProduct[] = products.map((product) => {
      const availableQuantity = Math.max(0, product.inventory.quantity - product.inventory.reservedQuantity);
      return {
        id: product._id.toString(),
        sku: product.sku,
        title: product.title,
        totalQuantity: product.inventory.quantity,
        reservedQuantity: product.inventory.reservedQuantity,
        availableQuantity,
        lowStockThreshold: product.inventory.lowStockThreshold,
        status: product.status,
      };
    });

    const responseData: GetLowStockResponse = {
      products: mappedProducts,
      count: mappedProducts.length,
    };
    const response = createSecureResponse(responseData, 200, request);
    
    response.headers.set('Cache-Control', 'private, s-maxage=300, stale-while-revalidate=600');
    return response;
  } catch (error) {
    logError('low stock GET API', error);
    return createSecureErrorResponse('Failed to retrieve low stock alerts', 500, request);
  }
}
