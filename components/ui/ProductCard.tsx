'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { urlFor } from '@/lib/cms/client';
import { JewelryDesign } from '@/types/cms';
import { ANIMATION_3D } from '@/lib/animations/constants';
import { formatPrice } from '@/lib/utils/price-formatting';

interface ProductCardProps {
  design: JewelryDesign;
  variant?: 'default' | 'compact';
  showDescription?: boolean;
  index?: number;
}

/**
 * Reusable Product Card component
 */
export default function ProductCard({ 
  design, 
  variant = 'default',
  showDescription = false,
  index = 0
}: ProductCardProps) {
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

  const imageUrl = design.image 
    ? urlFor(design.image).width(600).height(600).url()
    : null;
  
  const href = `/designs/${design.slug?.current || design._id}`;
  const productAriaLabel = `View ${design.title}${design.price ? ` - ${formatPrice(design.price)}` : ''}`;
  
  const isCompact = variant === 'compact';
  const imageHeight = isCompact 
    ? 'h-40 sm:h-48 md:h-56 lg:h-64' 
    : 'h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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

  return (
    <motion.div
      ref={cardRef}
      initial={{ 
        opacity: 0, 
        y: ANIMATION_3D.ENTRY.INITIAL_Y, 
        scale: ANIMATION_3D.ENTRY.INITIAL_SCALE, 
        rotateY: ANIMATION_3D.ENTRY.INITIAL_ROTATE_Y 
      }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
      viewport={{ once: ANIMATION_3D.VIEWPORT.ONCE, margin: ANIMATION_3D.VIEWPORT.MARGIN }}
      transition={{ 
        duration: ANIMATION_3D.ENTRY.DURATION, 
        delay: index * ANIMATION_3D.STAGGER.PRODUCT_CARD,
        ease: ANIMATION_3D.ENTRY.EASE,
        type: ANIMATION_3D.ENTRY.TYPE,
        stiffness: ANIMATION_3D.ENTRY.STIFFNESS,
        damping: ANIMATION_3D.ENTRY.DAMPING
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
      <Link href={href} aria-label={productAriaLabel}>
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
          <motion.div 
            className={`relative ${imageHeight} rounded-lg overflow-hidden mb-3 sm:mb-4 bg-[#faf8f5] p-2 sm:p-3 md:p-4`}
            animate={{
              boxShadow: isHovered ? ANIMATION_3D.SHADOW.HOVER : ANIMATION_3D.SHADOW.DEFAULT,
            }}
            transition={{ duration: ANIMATION_3D.SHADOW.TRANSITION_DURATION, ease: 'easeOut' }}
          >
            {/* Gradient background */}
            <div 
              className="absolute inset-0 z-0"
              style={{
                background: 'linear-gradient(135deg, rgba(204, 196, 186, 0.15) 0%, rgba(250, 248, 245, 0.25) 50%, rgba(204, 196, 186, 0.15) 100%)',
              }}
            />
            
            {/* Standardized shine overlay effect */}
            <motion.div
              className="absolute inset-0 z-20 pointer-events-none"
              initial={{ x: '-100%', opacity: 0 }}
              animate={isHovered ? { x: '200%', opacity: ANIMATION_3D.SHINE.PRIMARY.OPACITY } : { x: '-100%', opacity: 0 }}
              transition={{ duration: ANIMATION_3D.SHINE.PRIMARY.DURATION, ease: ANIMATION_3D.SHINE.PRIMARY.EASE }}
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
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
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
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
                    background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.6) 0%, transparent 70%)',
                    filter: `blur(${ANIMATION_3D.GLOW.BLUR})`,
                  }}
                />
                
                <Image
                  src={imageUrl}
                  alt={design.image?.alt || design.title}
                  fill
                  className="object-contain mix-blend-multiply relative z-10"
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
                
                {/* Edge highlight */}
                <motion.div
                  className="absolute inset-0 z-15 pointer-events-none"
                  animate={{
                    opacity: isHovered ? 0.5 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    boxShadow: 'inset 0 0 40px rgba(255, 255, 255, 0.4)',
                  }}
                />
              </motion.div>
            ) : (
              <div className="w-full h-full flex items-center justify-center z-10 relative">
                <p className="text-[#918c87] text-body-sm">No image</p>
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
            <h3 className="text-[#2a2a2a] text-lg sm:text-xl md:text-2xl uppercase font-playfair font-bold">
              {design.title}
            </h3>
            {design.material && (
              <p className="text-[#6a6a6a] text-sm sm:text-base font-inter font-normal">
                {design.material}
              </p>
            )}
            {showDescription && design.description && (
              <p className="text-[#6a6a6a] text-body-base line-clamp-2 font-inter">
                {design.description}
              </p>
            )}
            {design.price && (
              <motion.p 
                className="text-[#2a2a2a] text-lg sm:text-xl md:text-2xl font-bold font-playfair"
                animate={isHovered ? { scale: 1.03 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {formatPrice(design.price)}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

