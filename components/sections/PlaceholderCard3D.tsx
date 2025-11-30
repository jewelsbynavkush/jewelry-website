'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ANIMATION_3D } from '@/lib/animations/constants';

interface PlaceholderCard3DProps {
  imageSrc: string;
  index: number;
}

/**
 * 3D placeholder card component with enhanced animations
 */
export default function PlaceholderCard3D({ imageSrc, index }: PlaceholderCard3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 3D tilt effect values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Enhanced 3D tilt
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
      className="p-2 sm:p-3 md:p-4"
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
    >
      <Link href="/designs" className="block" aria-label="View all designs">
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
            className="relative h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 rounded-lg overflow-hidden mb-3 sm:mb-4 bg-[#faf8f5] p-2 sm:p-3 md:p-4"
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
                  background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.6) 0%, transparent 70%)',
                  filter: `blur(${ANIMATION_3D.GLOW.BLUR})`,
                }}
              />
              
              <Image
                src={imageSrc}
                alt="Jewelry product"
                fill
                  className="object-contain mix-blend-multiply relative z-10"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                unoptimized
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
          </motion.div>
          
          <motion.div 
            className="space-y-1 px-1"
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
            <h3 className="text-[#2a2a2a] text-body-sm md:text-body-base uppercase font-playfair font-bold">
              Product Name
            </h3>
            <p className="text-[#6a6a6a] text-body-xs md:text-body-sm font-inter font-normal">
              Material
            </p>
            <p className="text-[#2a2a2a] text-body-sm md:text-body-base font-bold font-playfair">
              $0.00
            </p>
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

