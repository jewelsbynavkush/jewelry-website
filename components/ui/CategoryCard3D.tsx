'use client';

import { useState, useRef, MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ANIMATION_3D } from '@/lib/animations/constants';

interface CategoryCard3DProps {
  name: string;
  href: string;
  imageSrc: string;
  index?: number;
}

/**
 * Professional 3D category card with hover effects
 */
export default function CategoryCard3D({ 
  name, 
  href, 
  imageSrc,
  index = 0 
}: CategoryCard3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 3D tilt effect
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
      initial={{ opacity: ANIMATION_3D.ENTRY.INITIAL_OPACITY, y: ANIMATION_3D.ENTRY.INITIAL_Y, scale: ANIMATION_3D.ENTRY.INITIAL_SCALE }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
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
      className="group"
    >
      <Link href={href}>
        <motion.div
          style={{
            rotateX,
            rotateY,
            translateZ,
            transformStyle: 'preserve-3d',
          }}
          className="relative"
        >
          <motion.div
            className="relative h-64 sm:h-72 md:h-80 lg:h-96 rounded-lg overflow-hidden bg-[var(--beige)]"
            animate={{
              boxShadow: isHovered 
                ? `0 20px 40px -10px var(--shadow-dark), 0 0 0 1px var(--white-opacity-20)`
                : `0 4px 6px -1px var(--shadow-light)`,
            }}
            transition={{ duration: 0.3 }}
          >
            {/* Gradient overlay - static, no animation */}
            <div 
              className="absolute inset-0 z-10"
              style={{
                background: `linear-gradient(135deg, var(--gradient-beige-medium) 0%, var(--gradient-cream-medium) 50%, var(--gradient-beige-medium) 100%)`,
                transform: 'none', // Prevent inheriting parent transforms
                willChange: 'auto', // No animation needed
              }}
            />
            
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 z-20 pointer-events-none"
              initial={{ x: '-100%', opacity: 0 }}
              animate={isHovered ? { x: '200%', opacity: 1 } : { x: '-100%', opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              style={{
                background: `linear-gradient(90deg, transparent, var(--white-opacity-30), transparent)`,
                width: '60%',
              }}
            />
            
            {/* Image */}
            <motion.div 
              className="relative w-full h-full z-0"
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
                src={imageSrc}
                alt={`${name} jewelry collection - Handcrafted ${name.toLowerCase()} pieces`}
                fill
                className="object-cover mix-blend-multiply"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
              />
            </motion.div>
            
            {/* Category name overlay */}
            <motion.div
              className="absolute inset-0 z-30 flex items-center justify-center"
              initial={{ opacity: 0.9 }}
              whileHover={{ opacity: 1 }}
            >
              <motion.h3
                className="text-[var(--text-on-beige)] font-section-heading text-2xl sm:text-3xl md:text-4xl uppercase"
                animate={isHovered ? { 
                  scale: ANIMATION_3D.SCALE.TEXT_HOVER, 
                  y: ANIMATION_3D.HOVER.TEXT_LIFT 
                } : { 
                  scale: 1, 
                  y: 0 
                }}
                transition={{ duration: ANIMATION_3D.HOVER.DURATION }}
              >
                {name}
              </motion.h3>
            </motion.div>
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

