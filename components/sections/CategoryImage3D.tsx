'use client';

import { useState, useRef, MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import { ANIMATION_3D } from '@/lib/animations/constants';

import { CategoryImageSource, CategoryType } from '@/lib/utils/image-helpers';

interface CategoryImage3DProps {
  category: CategoryType;
  imageSource: CategoryImageSource | null;
  index?: number;
}

/**
 * 3D animated category image component
 */
export default function CategoryImage3D({ category, imageSource, index = 0 }: CategoryImage3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
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
        delay: index * ANIMATION_3D.STAGGER.CATEGORY_IMAGE,
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
      className="relative flex-1 flex items-center justify-center my-8 md:my-12 p-2 sm:p-3 md:p-4"
    >
      <Link 
        href={category.href} 
        className="relative w-full max-w-md cursor-pointer"
        aria-label={`View ${category.name} collection`}
      >
        {imageSource ? (
          <motion.div
            style={{
              rotateX,
              rotateY,
              translateZ,
              scale,
              transformStyle: 'preserve-3d',
            }}
            className="relative w-full aspect-square rounded-lg overflow-hidden"
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
            
            {/* Image container */}
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
              
              <Image
                src={imageSource.src}
                alt={imageSource.alt || `${category.name} jewelry collection - Exquisite handcrafted ${category.name.toLowerCase()} pieces`}
                fill
                className="object-contain mix-blend-multiply relative z-10"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized={false}
              />
              
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
            
            {/* Standardized shadow */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                boxShadow: isHovered ? ANIMATION_3D.SHADOW.HOVER : ANIMATION_3D.SHADOW.DEFAULT,
              }}
              transition={{ duration: ANIMATION_3D.SHADOW.TRANSITION_DURATION, ease: 'easeOut' }}
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

