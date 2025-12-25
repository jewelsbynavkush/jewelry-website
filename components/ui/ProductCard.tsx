'use client';

import { useState, useRef, MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Product } from '@/types/data';
import { ANIMATION_3D } from '@/lib/animations/constants';
import { formatPrice } from '@/lib/utils/price-formatting';
import ProductBadge from './ProductBadge';

interface ProductCardProps {
  product?: Product;
  variant?: 'default' | 'compact';
  showDescription?: boolean;
  index?: number;
  // Placeholder mode props
  placeholderImage?: string;
  placeholderTitle?: string;
  placeholderMaterial?: string;
  placeholderPrice?: number;
  placeholderHref?: string;
}

/**
 * Reusable Product Card component
 */
export default function ProductCard({ 
  product,
  variant = 'default',
  showDescription = false,
  index = 0,
  // Placeholder props
  placeholderImage,
  placeholderTitle = 'Product Name',
  placeholderMaterial = 'Material',
  placeholderPrice = 0,
  placeholderHref = '/designs',
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Check if this is a placeholder card
  const isPlaceholder = !product && !!placeholderImage;
  
  // 3D tilt effect values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Standardized 3D tilt effects
  const rotateX = useSpring(useTransform(y, [ANIMATION_3D.ROTATION.RANGE_MIN, ANIMATION_3D.ROTATION.RANGE_MAX], [ANIMATION_3D.ROTATION.MAX, -ANIMATION_3D.ROTATION.MAX]), {
    stiffness: ANIMATION_3D.SPRING.STIFFNESS,
    damping: ANIMATION_3D.SPRING.DAMPING
  });
  const rotateY = useSpring(useTransform(x, [ANIMATION_3D.ROTATION.RANGE_MIN, ANIMATION_3D.ROTATION.RANGE_MAX], [-ANIMATION_3D.ROTATION.MAX, ANIMATION_3D.ROTATION.MAX]), {
    stiffness: ANIMATION_3D.SPRING.STIFFNESS,
    damping: ANIMATION_3D.SPRING.DAMPING
  });
  
  // Standardized Z-axis translation for depth
  const distanceX = useTransform(x, (v) => Math.abs(v));
  const distanceY = useTransform(y, (v) => Math.abs(v));
  const translateZ = useSpring(useTransform(
    [distanceX, distanceY],
    ([dx, dy]: number[]) => {
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance * ANIMATION_3D.DEPTH.MULTIPLIER;
    }
  ), {
    stiffness: ANIMATION_3D.SPRING.STIFFNESS,
    damping: ANIMATION_3D.SPRING.DAMPING
  });
  
  // Standardized scale effect
  const scale = useSpring(useTransform(
    [distanceX, distanceY],
    ([dx, dy]: number[]) => {
      const distance = Math.sqrt(dx * dx + dy * dy);
      return isHovered ? 1 + distance * ANIMATION_3D.SCALE.HOVER_MULTIPLIER : 1;
    }
  ), {
    stiffness: ANIMATION_3D.SPRING.STIFFNESS,
    damping: ANIMATION_3D.SPRING.DAMPING
  });

  // Use product data or placeholder data
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

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const normalizedX = mouseX / (rect.width / 2);
    const normalizedY = mouseY / (rect.height / 2);
    
    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  // Professional animation: always visible, subtle entrance on scroll
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: ANIMATION_3D.ENTRY.INITIAL_OPACITY, y: ANIMATION_3D.ENTRY.INITIAL_Y, scale: ANIMATION_3D.ENTRY.INITIAL_SCALE, rotateY: ANIMATION_3D.ENTRY.INITIAL_ROTATE_Y }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
      viewport={{ 
        once: ANIMATION_3D.VIEWPORT.ONCE, 
        margin: ANIMATION_3D.VIEWPORT.MARGIN,
        amount: ANIMATION_3D.VIEWPORT.AMOUNT 
      }}
      transition={{ 
        duration: ANIMATION_3D.ENTRY.DURATION, 
        delay: index * ANIMATION_3D.STAGGER.PRODUCT_CARD,
        ease: ANIMATION_3D.ENTRY.EASE,
        // Use 'tween' for entry animations (better scroll performance)
        type: 'tween' as const,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: ANIMATION_3D.PERSPECTIVE,
        transformStyle: 'preserve-3d',
      }}
      className="group"
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
          style={{
            rotateX,
            rotateY,
            translateZ,
            scale,
            transformStyle: 'preserve-3d',
          }}
          className="relative"
        >
          {/* Product Badges */}
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
            className={`relative ${imageHeight} rounded-lg overflow-hidden mb-3 sm:mb-4 bg-[var(--cream)] p-2 sm:p-3 md:p-4`}
            animate={{
              boxShadow: isHovered ? ANIMATION_3D.SHADOW.HOVER : ANIMATION_3D.SHADOW.DEFAULT,
            }}
            transition={{ duration: ANIMATION_3D.SHADOW.TRANSITION_DURATION, ease: 'easeOut' }}
          >
            {/* Gradient background - static, no animation */}
            <div 
              className="absolute inset-0 z-0"
              style={{
                background: `linear-gradient(135deg, var(--gradient-beige-light) 0%, var(--gradient-cream-light) 50%, var(--gradient-beige-light) 100%)`,
                transform: 'none', // Prevent inheriting parent transforms
                willChange: 'auto', // No animation needed
              }}
            />
            
            {/* Standardized shine overlay effect */}
            <motion.div
              className="absolute inset-0 z-20 pointer-events-none"
              initial={{ x: '-100%', opacity: 0 }}
              animate={isHovered ? { x: '200%', opacity: ANIMATION_3D.SHINE.PRIMARY.OPACITY } : { x: '-100%', opacity: 0 }}
              transition={{ duration: ANIMATION_3D.SHINE.PRIMARY.DURATION, ease: ANIMATION_3D.SHINE.PRIMARY.EASE }}
              style={{
                background: `linear-gradient(90deg, transparent, var(--white-opacity-40), transparent)`,
                width: ANIMATION_3D.SHINE.PRIMARY.WIDTH,
              }}
            />
            
            {/* Standardized secondary shine for depth */}
            <motion.div
              className="absolute inset-0 z-15 pointer-events-none"
              initial={{ x: '-150%', opacity: 0 }}
              animate={isHovered ? { x: '250%', opacity: ANIMATION_3D.SHINE.SECONDARY.OPACITY } : { x: '-150%', opacity: 0 }}
              transition={{ duration: ANIMATION_3D.SHINE.SECONDARY.DURATION, delay: ANIMATION_3D.SHINE.SECONDARY.DELAY, ease: ANIMATION_3D.SHINE.SECONDARY.EASE }}
              style={{
                background: `linear-gradient(90deg, transparent, var(--white-opacity-20), transparent)`,
                width: ANIMATION_3D.SHINE.SECONDARY.WIDTH,
              }}
            />
            
            {imageUrl ? (
              <motion.div 
                className="relative w-full h-full z-10"
                animate={isHovered ? { 
                  scale: ANIMATION_3D.SCALE.IMAGE_HOVER, 
                  filter: ANIMATION_3D.FILTER.HOVER,
                } : { 
                  scale: 1, 
                  filter: ANIMATION_3D.FILTER.DEFAULT,
                }}
                transition={{ duration: ANIMATION_3D.HOVER.DURATION, ease: ANIMATION_3D.HOVER.EASE }}
              >
                {/* Standardized glow effect on hover */}
                <motion.div
                  className="absolute inset-0 z-5 pointer-events-none"
                  animate={{
                    opacity: isHovered ? ANIMATION_3D.GLOW.OPACITY : 0,
                    scale: isHovered ? ANIMATION_3D.GLOW.SCALE : 1,
                  }}
                  transition={{ duration: ANIMATION_3D.GLOW.DURATION }}
                  style={{
                    background: `radial-gradient(circle at center, var(--white-opacity-60) 0%, transparent 70%)`,
                    filter: `blur(${ANIMATION_3D.GLOW.BLUR})`,
                  }}
                />
                
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
                  <div className="w-full h-full flex items-center justify-center z-10 relative" role="img" aria-label="Product image unavailable">
                    <p className="text-[var(--text-muted)] text-body-sm">Image unavailable</p>
                  </div>
                )}
                
                {/* Edge highlight */}
                <motion.div
                  className="absolute inset-0 z-15 pointer-events-none"
                  animate={{
                    opacity: isHovered ? 0.5 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    boxShadow: `inset 0 0 40px var(--white-opacity-40)`,
                  }}
                />
              </motion.div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center z-10 relative">
                      <p className="text-[var(--text-muted)] text-body-sm">No image</p>
                    </div>
                  )}
          </motion.div>
          
          <motion.div 
            className="space-y-1"
            animate={isHovered ? { 
              y: ANIMATION_3D.HOVER.TEXT_LIFT,
              scale: ANIMATION_3D.SCALE.TEXT_HOVER,
            } : { 
              y: 0,
              scale: 1,
            }}
            transition={{ 
              duration: ANIMATION_3D.HOVER.DURATION,
              ease: ANIMATION_3D.HOVER.EASE
            }}
          >
            {/* SEO-critical content: All props come from server components, so content is server-rendered */}
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
              <motion.p 
                className="text-[var(--text-on-cream)] text-base sm:text-lg md:text-xl font-bold font-playfair"
                animate={isHovered ? { scale: 1.03 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {formatPrice(product?.price || placeholderPrice)}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

