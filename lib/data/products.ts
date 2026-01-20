/**
 * Product data access layer
 * Reads from MongoDB - Only returns products from active categories
 */

import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import type { Product as ProductType } from '@/types/data';
import { logError } from '@/lib/security/error-handler';

/**
 * Get all active products, optionally filtered by category, featured, mostLoved with pagination
 * Only returns products from active categories
 * 
 * Products are sorted by most recently updated/created to show latest items first.
 * 
 * @param category - Optional category slug filter (must be an active category)
 * @param featured - Optional filter for featured products
 * @param mostLoved - Optional filter for most loved products
 * @param limit - Number of products per page (default: 20)
 * @param page - Page number (default: 1)
 * @returns Object with products array and pagination metadata
 */
export async function getProducts(
  category?: string,
  featured?: boolean,
  mostLoved?: boolean,
  limit: number = 20,
  page: number = 1
): Promise<{ products: ProductType[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  try {
    await connectDB();
    
    // Base query: only return products with active status
    const query: Record<string, unknown> = { status: 'active' };
    
    // Apply featured filter if provided
    if (featured === true) {
      query.featured = true;
    }
    
    // Apply mostLoved filter if provided
    if (mostLoved === true) {
      query.mostLoved = true;
    }
    
    // If category filter provided, verify category is active before filtering
    // Prevents showing products from disabled categories
    if (category) {
      const activeCategory = await Category.findOne({ 
        slug: category.toLowerCase(),
        active: true 
      });
      
      if (activeCategory) {
        query.category = category.toLowerCase();
      } else {
        // Category is inactive or doesn't exist - return empty to prevent showing hidden products
        return {
          products: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        };
      }
    } else {
      // No category filter: ensure products only come from active categories
      // Prevents products from disabled categories appearing in "all products" view
      const activeCategories = await Category.find({ active: true }).select('slug').lean();
      const activeCategorySlugs = activeCategories.map(cat => cat.slug);
      query.category = { $in: activeCategorySlugs };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    
    const products = await Product.find(query)
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Transform to match existing Product type
    const transformedProducts = products.map(product => ({
      id: product._id.toString(),
      slug: product.slug,
      title: product.title,
      description: product.description,
      image: product.primaryImage || (product.images[0] || ''),
      alt: product.alt,
      price: product.price,
      currency: product.currency || 'INR', // Include currency field
      category: product.category,
      material: product.material,
      inStock: product.inStock,
      mostLoved: product.mostLoved,
      featured: product.featured,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));
    
    return {
      products: transformedProducts,
      pagination: { page, limit, total, totalPages },
    };
  } catch (error) {
    logError('getProducts', error);
    return {
      products: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    };
  }
}

/**
 * Get a single product by its slug identifier
 * Only returns product if it's from an active category
 * 
 * @param slug - Product slug (URL-friendly identifier)
 * @returns Product object if found and from active category, null otherwise
 */
export async function getProduct(slug: string): Promise<ProductType | null> {
  try {
    await connectDB();
    
    const product = await Product.findOne({ 
      slug: slug.toLowerCase(),
      status: 'active'
    }).lean();
    
    if (!product) {
      return null;
    }
    
    // Verify product's category is active
    const category = await Category.findOne({ 
      slug: product.category,
      active: true 
    });
    
    if (!category) {
      // Product's category is inactive
      return null;
    }
    
    // Transform to match existing Product type
    return {
      id: product._id.toString(),
      slug: product.slug,
      title: product.title,
      description: product.description,
      image: product.primaryImage || (product.images[0] || ''),
      alt: product.alt,
      price: product.price,
      currency: product.currency || 'INR', // Include currency field
      category: product.category,
      material: product.material,
      inStock: product.inStock,
      mostLoved: product.mostLoved,
      featured: product.featured,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  } catch (error) {
    logError('getProduct', error);
    return null;
  }
}

/**
 * Get products marked as "most loved"
 * Only returns products from active categories
 * 
 * Products are sorted by most recently updated/created to show latest items first.
 * 
 * @param limit - Maximum number of products to return (default: 8)
 * @returns Array of most loved products, sorted by most recent first
 */
export async function getMostLovedProducts(limit: number = 8): Promise<ProductType[]> {
  try {
    await connectDB();
    
    // Fetch only active category slugs to filter products
    // Ensures "most loved" products only come from visible categories
    const activeCategories = await Category.find({ active: true }).select('slug').lean();
    const activeCategorySlugs = activeCategories.map(cat => cat.slug);
    
    const products = await Product.find({
      status: 'active',
      mostLoved: true,
      category: { $in: activeCategorySlugs }
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();
    
    // Transform to match existing Product type
    return products.map(product => ({
      id: product._id.toString(),
      slug: product.slug,
      title: product.title,
      description: product.description,
      image: product.primaryImage || (product.images[0] || ''),
      alt: product.alt,
      price: product.price,
      currency: product.currency || 'INR', // Include currency field
      category: product.category,
      material: product.material,
      inStock: product.inStock,
      mostLoved: product.mostLoved,
      featured: product.featured,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));
  } catch (error) {
    logError('getMostLovedProducts', error);
    return [];
  }
}

/**
 * Get related products from the same category, excluding the current product
 * Only returns products if category is active
 * 
 * Products are sorted by most recently updated/created to show latest items first.
 * 
 * @param category - Product category slug to filter by
 * @param excludeId - Product ID to exclude from results
 * @param limit - Maximum number of products to return (default: 4)
 * @returns Array of related products, sorted by most recent first
 */
export async function getRelatedProducts(
  category: string,
  excludeId: string,
  limit: number = 4
): Promise<ProductType[]> {
  try {
    await connectDB();
    
    // Verify category is active
    const activeCategory = await Category.findOne({ 
      slug: category.toLowerCase(),
      active: true 
    });
    
    if (!activeCategory) {
      // Category is inactive, return empty
      return [];
    }
    
    const products = await Product.find({
      status: 'active',
      category: category.toLowerCase(),
      _id: { $ne: excludeId }
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();
    
    // Transform to match existing Product type
    return products.map(product => ({
      id: product._id.toString(),
      slug: product.slug,
      title: product.title,
      description: product.description,
      image: product.primaryImage || (product.images[0] || ''),
      alt: product.alt,
      price: product.price,
      currency: product.currency || 'INR', // Include currency field
      category: product.category,
      material: product.material,
      inStock: product.inStock,
      mostLoved: product.mostLoved,
      featured: product.featured,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));
  } catch (error) {
    logError('getRelatedProducts', error);
    return [];
  }
}

/**
 * Get image URLs for each active product category
 * 
 * Uses the first product found in each active category as the category image.
 * Only returns images for active categories.
 * 
 * @returns Object mapping active category slugs to image URLs
 */
export async function getCategoryImages(): Promise<Record<string, string>> {
  try {
    await connectDB();
    
    // Fetch active categories sorted by display order
    // Only returns categories that should be visible to users
    const activeCategories = await Category.find({ active: true })
      .sort({ order: 1 })
      .lean();
    
    const categoryImages: Record<string, string> = {};
    
    // For each active category, get the first product's image
    for (const category of activeCategories) {
      const product = await Product.findOne({
        status: 'active',
        category: category.slug
      })
        .select('primaryImage images')
        .lean();
      
      if (product) {
        categoryImages[category.slug] = product.primaryImage || (product.images[0] || category.image);
      } else {
        // Fallback to category image if no products
        categoryImages[category.slug] = category.image;
      }
    }
    
    return categoryImages;
  } catch (error) {
    logError('getCategoryImages', error);
    return {};
  }
}

