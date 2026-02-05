import { NextRequest } from 'next/server';
import { getProducts } from '@/lib/data/products';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { sanitizeString } from '@/lib/security/sanitize';
import { SECURITY_CONFIG } from '@/lib/security/constants';
import { ECOMMERCE } from '@/lib/constants';
import type { GetProductsResponse } from '@/types/api';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

/**
 * Get valid active categories from database
 * This ensures only active categories are accepted
 */
async function getValidActiveCategories(): Promise<string[]> {
  try {
    await connectDB();
    const activeCategories = await Category.find({ active: true }).select('slug').lean();
    return activeCategories.map(cat => cat.slug);
  } catch (error) {
    logError('Error loading active categories', error);
    // Fallback to default categories if DB fails
    return ['rings', 'earrings', 'necklaces', 'bracelets'];
  }
}

export async function GET(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.PUBLIC_BROWSING,
  });
  if (securityResponse) return securityResponse;

  try {
    const { searchParams } = new URL(request.url);
    
    // Fetch active category slugs to filter products
    // Ensures "most loved" and "featured" products only come from visible categories
    const validCategories = await getValidActiveCategories();
    
    // Sanitize and validate category parameter (only active categories)
    const categoryParam = searchParams.get('category');
    const category = categoryParam && validCategories.includes(sanitizeString(categoryParam))
      ? sanitizeString(categoryParam)
      : undefined;
    
    // Validate boolean parameters
    const featured = searchParams.get('featured') === 'true';
    const mostLoved = searchParams.get('mostLoved') === 'true';
    
    // Extract pagination parameters with validation and defaults
    // Limits page size to 1-100 items per page for performance
    const { getPaginationParams } = await import('@/lib/utils/api-helpers');
    const { limit, page } = getPaginationParams(searchParams);

    // getProducts() filters by active categories, featured, mostLoved, and handles pagination
    const result = await getProducts(category, featured || undefined, mostLoved || undefined, limit, page);

    // Map to API response format
    const products = result.products.map(productData => ({
      id: productData.id,
      slug: productData.slug,
      title: productData.title,
      description: productData.description,
      shortDescription: productData.description.substring(0, 150),
      sku: productData.slug.toUpperCase().replace(/-/g, ''),
      price: productData.price ?? 0,
      currency: productData.currency ?? ECOMMERCE.currency,
      category: productData.category ?? '',
      material: productData.material ?? '',
      images: productData.image ? [productData.image] : [],
      primaryImage: productData.image ?? '',
      inStock: productData.inStock ?? false,
      featured: productData.featured ?? false,
      mostLoved: productData.mostLoved ?? false,
    }));

    const responseData: GetProductsResponse = {
      products,
      pagination: result.pagination,
    };
    const response = createSecureResponse(responseData, 200, request);
    
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response;
  } catch (error) {
    logError('products API', error);
    return createSecureErrorResponse('Failed to fetch products', 500, request);
  }
}

