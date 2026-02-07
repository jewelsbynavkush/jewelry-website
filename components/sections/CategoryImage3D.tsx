'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import { getCDNUrl } from '@/lib/utils/cdn';
import { TILT_3D, SCALE, DURATION, SHADOW, EASING } from '@/lib/animations/constants';
import { CategoryImageSource, CategoryType } from '@/lib/utils/image-helpers';
import { use3DTilt } from '@/lib/hooks/use3DTilt';

interface CategoryImage3DProps {
  category: CategoryType;
  imageSource: CategoryImageSource | null;
}

/**
 * Category image component with professional 3D animations
 */
export default function CategoryImage3D({ category, imageSource }: CategoryImage3DProps) {
  // 3D tilt effect using centralized hook for consistent animation behavior
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
  } = use3DTilt();

  return (
    <motion.div 
      ref={cardRef}
      className="relative flex-1 flex items-center justify-center my-8 md:my-12 p-2 sm:p-3 md:p-4"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        perspective: `${TILT_3D.PERSPECTIVE}px`,
      }}
    >
      <Link 
        href={`/designs?category=${category.slug}`} 
        className="relative w-full max-w-md cursor-pointer"
        aria-label={`View ${category.displayName || category.name || category.slug} collection`}
      >
        {imageSource ? (
          <motion.div 
            className="relative w-full aspect-square rounded-lg"
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
              scale: isPressed ? SCALE.TAP : isHovered ? SCALE.CARD_HOVER : 1,
              transition: `scale ${DURATION.SCALE}s ${EASING.EASE_OUT}`,
              overflow: 'visible',
            }}
          >
            {/* Container with overflow hidden for rounded corners */}
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              {/* Gradient background */}
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, var(--gradient-beige-light) 0%, var(--gradient-cream-light) 50%, var(--gradient-beige-light) 100%)`,
                  zIndex: 0,
                }}
              />
              
              {/* Image container */}
              <div 
                className="relative w-full h-full"
                style={{
                  zIndex: 10,
                }}
              >
                <motion.div
                  className="relative w-full h-full"
                  style={{
                    scale: isHovered ? SCALE.CATEGORY_IMAGE_ZOOM : 1,
                    transition: `scale ${DURATION.IMAGE_ZOOM}s cubic-bezier(${EASING.STANDARD.join(', ')})`,
                  }}
                >
                  <Image
                    src={getCDNUrl(imageSource.src)}
                    alt={imageSource.alt || `${category.name} jewelry collection - Exquisite handcrafted ${category.name.toLowerCase()} pieces`}
                    fill
                    className="object-contain mix-blend-multiply relative"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized={false}
                    style={{ zIndex: 15 }}
                  />
                </motion.div>
                {/* Shine overlay effect - subtle */}
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
              </div>
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
        ) : (
          <div className="w-full max-w-md aspect-square rounded-lg overflow-hidden">
            <ImagePlaceholder text={`${category.name} image`} />
          </div>
        )}
      </Link>
    </motion.div>
  );
}
