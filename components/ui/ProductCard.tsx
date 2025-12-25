'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/data';
import { formatPrice } from '@/lib/utils/price-formatting';
import ProductBadge from './ProductBadge';
import ImagePlaceholder from './ImagePlaceholder';

interface ProductCardProps {
  product?: Product;
  variant?: 'default' | 'compact';
  showDescription?: boolean;
  placeholderImage?: string;
  placeholderTitle?: string;
  placeholderMaterial?: string;
  placeholderPrice?: number;
  placeholderHref?: string;
}

/**
 * Reusable Product Card component
 * Displays product information with image, badges, price, and stock status
 */
export default function ProductCard({ 
  product,
  variant = 'default',
  showDescription = false,
  placeholderImage,
  placeholderTitle = 'Product Name',
  placeholderMaterial = 'Material',
  placeholderPrice = 0,
  placeholderHref = '/designs',
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const isPlaceholder = !product && !!placeholderImage;
  const imageUrl = product?.image || placeholderImage || null;
  const href = product ? `/designs/${product.slug}` : placeholderHref;
  const isOutOfStock = product?.inStock === false;
  const productAriaLabel = product 
    ? `${isOutOfStock ? 'Out of stock: ' : ''}View ${product.title}${product.price ? ` - ${formatPrice(product.price)}` : ''}`
    : 'View all designs';
  
  const isCompact = variant === 'compact';
  const imageHeight = isCompact 
    ? 'h-40 sm:h-48 md:h-56 lg:h-64' 
    : 'h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80';

  return (
    <div className="group">
      <Link 
        href={isOutOfStock ? '#' : href} 
        aria-label={productAriaLabel}
        aria-disabled={isOutOfStock}
        className={isOutOfStock ? 'cursor-not-allowed opacity-75 pointer-events-none' : ''}
        onClick={(e) => {
          if (isOutOfStock) {
            e.preventDefault();
          }
        }}
      >
        <div className="relative">
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-30 flex flex-wrap gap-1 sm:gap-2">
            {product?.featured && <ProductBadge type="featured" />}
            {product?.mostLoved && <ProductBadge type="mostLoved" />}
            {product && (() => {
              const createdAt = new Date(product.createdAt).getTime();
              const now = new Date().getTime();
              const daysSinceCreation = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
              if (daysSinceCreation < 30) {
                return <ProductBadge type="new" />;
              }
              return null;
            })()}
            {product?.inStock === false && <ProductBadge type="outOfStock" />}
          </div>
          
          <div className={`relative ${imageHeight} rounded-lg overflow-hidden mb-3 sm:mb-4 bg-[var(--cream)] p-2 sm:p-3 md:p-4`}>
            <div 
              className="absolute inset-0 z-0"
              style={{
                background: `linear-gradient(135deg, var(--gradient-beige-light) 0%, var(--gradient-cream-light) 50%, var(--gradient-beige-light) 100%)`,
              }}
            />
            
            {imageUrl ? (
              <div className="relative w-full h-full z-10">
                {!imageError && imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product?.alt || `${product?.title || placeholderTitle} - Handcrafted jewelry piece${product?.material ? ` made from ${product.material}` : ''}`}
                    fill
                    className="object-contain mix-blend-multiply relative z-10"
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    unoptimized={isPlaceholder}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <ImagePlaceholder 
                    text="Image unavailable" 
                    className="z-10 relative"
                  />
                )}
              </div>
            ) : (
              <ImagePlaceholder 
                text="No image" 
                className="z-10 relative"
              />
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-[var(--text-on-cream)] text-base sm:text-lg md:text-xl uppercase font-playfair font-bold">
              {product?.title || placeholderTitle}
            </h3>
            {(product?.material || isPlaceholder) && (
              <p className="text-[var(--text-secondary)] text-xs sm:text-sm font-inter font-normal">
                {product?.material || placeholderMaterial}
              </p>
            )}
            {showDescription && product?.description && (
              <p className="text-[var(--text-secondary)] text-body-sm line-clamp-2 font-inter">
                {product.description}
              </p>
            )}
            {(product?.price || isPlaceholder) && (
              <p className="text-[var(--text-on-cream)] text-base sm:text-lg md:text-xl font-bold font-playfair">
                {formatPrice(product?.price || placeholderPrice)}
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
