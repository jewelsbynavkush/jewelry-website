'use client';

import { motion, useReducedMotion, useInView } from 'framer-motion';
import { ReactNode, useRef } from 'react';
import { ANIMATION_3D } from '@/lib/animations/constants';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';
  className?: string;
  stagger?: boolean;
  index?: number;
}

/**
 * Professional scroll-triggered reveal animation component
 * Respects prefers-reduced-motion for accessibility
 * Ensures content is always visible, even if already in viewport on page load
 */
export default function ScrollReveal({ 
  children, 
  delay = 0,
  direction = 'up',
  className = '',
  stagger = false,
  index = 0
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: ANIMATION_3D.VIEWPORT.ONCE, 
    margin: ANIMATION_3D.VIEWPORT.MARGIN,
    amount: 0.1 // Trigger when at least 10% is visible
  });
  
  const directions = {
    up: { y: shouldReduceMotion ? 0 : 60, x: 0, scale: 1 },
    down: { y: shouldReduceMotion ? 0 : -60, x: 0, scale: 1 },
    left: { y: 0, x: shouldReduceMotion ? 0 : 60, scale: 1 },
    right: { y: 0, x: shouldReduceMotion ? 0 : -60, scale: 1 },
    fade: { y: 0, x: 0, scale: 1 },
    scale: { y: 0, x: 0, scale: shouldReduceMotion ? 1 : 0.9 },
  };

  const initial = directions[direction];
  const staggerDelay = stagger ? index * 0.1 : 0;

  // Use isInView directly - no need for separate state
  // Fallback animation is handled by motion's initial/animate props
  const shouldAnimate = isInView || shouldReduceMotion;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...initial }}
      animate={shouldAnimate ? { opacity: 1, y: 0, x: 0, scale: 1 } : { opacity: 0, ...initial }}
      transition={{
        duration: shouldReduceMotion ? 0.2 : ANIMATION_3D.ENTRY.DURATION,
        delay: shouldReduceMotion ? 0 : delay + staggerDelay,
        ease: ANIMATION_3D.ENTRY.EASE,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

