'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { TILT_3D, SCALE, DURATION, SHADOW, EASING, TRANSLATE } from '@/lib/animations/constants';
import { use3DTilt } from '@/lib/hooks/use3DTilt';

interface CategoryCard3DProps {
  name: string;
  href: string;
  imageSrc: string;
}

/**
 * Category card component with professional 3D animations
 */
export default function CategoryCard3D({ 
  name, 
  href, 
  imageSrc
}: CategoryCard3DProps) {
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
      className="group"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        perspective: `${TILT_3D.PERSPECTIVE}px`,
      }}
    >
      <Link href={href} aria-label={`View ${name} collection`}>
        <motion.div 
          className="relative h-48 sm:h-56 md:h-64 lg:h-72 rounded-lg overflow-hidden mb-3 sm:mb-4 bg-[var(--cream)] p-2 sm:p-3 md:p-4"
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
            scale: isPressed ? SCALE.TAP : isHovered ? SCALE.CARD_HOVER : 1,
            transition: `scale ${DURATION.SCALE}s ${EASING.EASE_OUT}`,
          }}
        >
          {/* Gradient background */}
          <div 
            className="absolute inset-0 z-0"
            style={{
              background: `linear-gradient(135deg, var(--gradient-beige-light) 0%, var(--gradient-cream-light) 50%, var(--gradient-beige-light) 100%)`,
            }}
          />
          
          <motion.div 
            className="relative w-full h-full z-10"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            <motion.div
              style={{
                    scale: isHovered ? SCALE.CATEGORY_IMAGE_ZOOM : 1,
                    transition: `scale ${DURATION.IMAGE_ZOOM}s cubic-bezier(${EASING.STANDARD.join(', ')})`,
              }}
            >
              <Image
                src={imageSrc}
                alt={`${name} jewelry collection - Exquisite handcrafted ${name.toLowerCase()} pieces`}
                fill
                className="object-contain mix-blend-multiply relative z-10"
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </motion.div>
            {/* Shine overlay effect */}
            {isHovered && (
              <motion.div
                className="absolute inset-0 z-20 pointer-events-none"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                    duration: DURATION.SHINE_CARD,
                    ease: EASING.EASE_IN_OUT,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
                style={{
                  background: `linear-gradient(90deg, transparent 0%, var(--white-opacity-30) 50%, transparent 100%)`,
                }}
              />
            )}
          </motion.div>
          {/* Enhanced shadow on hover */}
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
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
            {name}
          </motion.h3>
        </motion.div>
      </Link>
    </motion.div>
  );
}
