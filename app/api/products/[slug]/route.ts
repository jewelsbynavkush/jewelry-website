import { NextRequest } from 'next/server';
import { getProduct } from '@/lib/data/products';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { SECURITY_CONFIG } from '@/lib/security/constants';
import type { GetProductResponse } from '@/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Apply security (CORS, CSRF, rate limiting)
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.PUBLIC_BROWSING,
  });
  if (securityResponse) return securityResponse;

  try {
    const { slug } = await params;
    
    // Validate and sanitize slug parameter
    const { validateSlugParam } = await import('@/lib/utils/api-helpers');
    const validationResult = await validateSlugParam(slug, 'product identifier', request);
    if ('error' in validationResult) {
      return validationResult.error;
    }
    const sanitizedSlug = validationResult.value;
    const productData = await getProduct(sanitizedSlug);

    if (!productData) {
      return createSecureErrorResponse('Product not found', 404, request);
    }

    // Map to API response format
    const product: GetProductResponse['product'] = {
      id: productData.id,
      slug: productData.slug,
      title: productData.title,
      description: productData.description,
      shortDescription: productData.description.substring(0, 150), // Generate short description
      sku: productData.slug.toUpperCase().replace(/-/g, ''), // Generate SKU from slug
      price: productData.price ?? 0,
      currency: productData.currency ?? 'INR',
      category: productData.category ?? '',
      material: productData.material ?? '',
      images: productData.image ? [productData.image] : [],
      primaryImage: productData.image ?? '',
      inStock: productData.inStock ?? false,
      featured: productData.featured ?? false,
      mostLoved: productData.mostLoved ?? false,
    };

    const responseData: GetProductResponse = { product };
    const response = createSecureResponse(responseData, 200, request);
    
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response;
  } catch (error) {
    logError('products/[slug] API', error);
    return createSecureErrorResponse('Failed to fetch product', 500, request);
  }
}

