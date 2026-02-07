'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Product } from '@/types/data';
import { formatPrice } from '@/lib/utils/price-formatting';
import ProductBadge from './ProductBadge';
import ImagePlaceholder from './ImagePlaceholder';
import { SCALE, DURATION, SHADOW, EASING, TRANSLATE, TILT_3D } from '@/lib/animations/constants';
import { use3DTilt } from '@/lib/hooks/use3DTilt';

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
    ? `${isOutOfStock ? 'Out of stock: ' : ''}View ${product.title}${product.price ? ` - ${formatPrice(product.price, { currencyCode: product.currency || 'INR' })}` : ''}`
    : 'View all designs';
  
  const isCompact = variant === 'compact';
  const imageHeight = isCompact 
    ? 'h-40 sm:h-48 md:h-56 lg:h-64' 
    : 'h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80';

  // Disable 3D tilt for out-of-stock items to prevent interaction feedback
  const {
    cardRef,
    isHovered,
    isPressed,
    rotateX,
    rotateY,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseDown,
    handleMouseUp,
  } = use3DTilt(!isOutOfStock);

  // Prevent tilt animation when item is unavailable
  const handleMouseMoveWithCheck = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isOutOfStock) return;
    handleMouseMove(e);
  };

  const handleMouseEnterWithCheck = () => {
    if (isOutOfStock) return;
    handleMouseEnter();
  };

  return (
    <motion.div 
      ref={cardRef}
      className="group h-full"
      onMouseMove={handleMouseMoveWithCheck}
      onMouseEnter={handleMouseEnterWithCheck}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        perspective: `${TILT_3D.PERSPECTIVE}px`,
      }}
    >
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
        <motion.div 
          className="relative"
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
            scale: isPressed ? SCALE.TAP : isHovered ? SCALE.CARD_HOVER : 1,
            transition: `scale ${DURATION.SCALE}s ${EASING.EASE_OUT}`,
          }}
        >
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
          
          <motion.div 
            className={`relative ${imageHeight} rounded-lg mb-3 sm:mb-4 bg-[var(--cream)] p-2 sm:p-3 md:p-4`}
            style={{
              transformStyle: 'preserve-3d',
              overflow: 'visible',
            }}
          >
            {/* Container with overflow hidden for rounded corners */}
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, var(--gradient-beige-light) 0%, var(--gradient-cream-light) 50%, var(--gradient-beige-light) 100%)`,
                  zIndex: 0,
                }}
              />
              
              {imageUrl ? (
                <div 
                  className="relative w-full h-full"
                  style={{
                    zIndex: 10,
                  }}
                >
                  {!imageError && imageUrl ? (
                    <motion.div
                      className="relative w-full h-full"
                      style={{
                        scale: isHovered ? 1.05 : 1,
                        transition: 'scale 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        zIndex: 15,
                      }}
                    >
                      <Image
                        src={imageUrl}
                        alt={product?.alt || `${product?.title || placeholderTitle} - Handcrafted jewelry piece${product?.material ? ` made from ${product.material}` : ''}`}
                        fill
                        className="object-contain mix-blend-multiply relative"
                        loading="lazy"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        unoptimized={isPlaceholder}
                        onError={() => setImageError(true)}
                      />
                      {/* Shine overlay effect - inside image container, very subtle */}
                      {isHovered && (
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          initial={{ x: '-100%' }}
                          animate={{ x: '100%' }}
                          transition={{
                            duration: DURATION.SHINE_CARD,
                            ease: EASING.EASE_IN_OUT,
                            repeat: Infinity,
                            repeatDelay: 2,
                          }}
                      style={{
                        background: `linear-gradient(90deg, transparent 0%, var(--white-opacity-10) 50%, transparent 100%)`,
                        zIndex: 1,
                        mixBlendMode: 'screen',
                      }}
                        />
                      )}
                    </motion.div>
                  ) : (
                    <ImagePlaceholder 
                      text="Image unavailable" 
                      className="relative"
                    />
                  )}
                </div>
              ) : (
                <ImagePlaceholder 
                  text="No image" 
                  className="relative z-10"
                />
              )}
            </div>
            {/* Enhanced shadow on hover - outside container */}
            <motion.div
              className="absolute inset-0 rounded-lg pointer-events-none -z-10"
              style={{
                boxShadow: isHovered ? SHADOW.HOVER : SHADOW.BASE,
                transition: `box-shadow ${DURATION.SHADOW}s ${EASING.EASE_OUT}`,
              }}
            />
          </motion.div>
          
          <motion.div 
            className="space-y-1"
            style={{
              transform: isHovered ? `translateY(${TRANSLATE.LIFT}px)` : 'translateY(0)',
              transition: `transform ${DURATION.SHADOW}s ${EASING.EASE_OUT}`,
            }}
          >
            <motion.h3 
              className="text-[var(--text-on-cream)] text-base sm:text-lg md:text-xl uppercase font-playfair font-bold"
              style={{
                scale: isHovered ? SCALE.HOVER : 1,
                transition: `scale ${DURATION.SCALE}s ${EASING.EASE_OUT}`,
              }}
            >
              {product?.title || placeholderTitle}
            </motion.h3>
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
              <motion.p 
                className="text-[var(--text-on-cream)] text-base sm:text-lg md:text-xl font-bold font-playfair"
                style={{
                  scale: isHovered ? SCALE.HOVER : 1,
                  transition: `scale ${DURATION.SCALE}s ${EASING.EASE_OUT}`,
              }}
              >
                {formatPrice(product?.price || placeholderPrice, { 
                  currencyCode: product?.currency || 'INR' 
                })}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
