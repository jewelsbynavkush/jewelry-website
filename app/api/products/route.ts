import { NextRequest } from 'next/server';
import { getProducts } from '@/lib/data/products';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { sanitizeString } from '@/lib/security/sanitize';
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
  // Industry standard: 200 requests per 15 minutes for public browsing endpoints
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: { windowMs: 15 * 60 * 1000, maxRequests: 200 }, // 200 requests per 15 minutes (industry standard)
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
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 100); // 1-100 per page
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1); // Minimum page 1

    // getProducts() filters by active categories, featured, mostLoved, and handles pagination
    const result = await getProducts(category, featured || undefined, mostLoved || undefined, limit, page);

    const response = createSecureResponse(
      result,
      200,
      request
    );
    
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response;
  } catch (error) {
    logError('products API', error);
    return createSecureErrorResponse('Failed to fetch products', 500, request);
  }
}

