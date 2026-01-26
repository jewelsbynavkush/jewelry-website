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
import { SECURITY_CONFIG } from '@/lib/security/constants';
import type { GetLowStockResponse, LowStockProduct } from '@/types/api';

/**
 * GET /api/inventory/low-stock
 * Get products with low stock (admin only)
 */
export async function GET(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.INVENTORY_READ,
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
    // Sanitize and validate limit parameter to prevent DoS attacks
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam 
      ? Math.min(Math.max(parseInt(limitParam, 10), 1), 100) // 1-100 per page
      : 50; // Default to 50

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
