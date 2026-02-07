'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ANIMATION_PRESETS, SCALE, OPACITY, DURATION } from '@/lib/animations/constants';

interface SocialIconProps {
  href: string;
  ariaLabel: string;
  children: ReactNode;
}

/**
 * Social media icon component with professional 3D animations
 */
export default function SocialIcon({ href, ariaLabel, children }: SocialIconProps) {
  return (
    <motion.a 
      href={href} 
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-on-beige)] relative overflow-hidden"
      style={{ 
        backgroundColor: 'var(--white-opacity-20)',
      }}
      whileHover={{ 
        scale: SCALE.ICON_HOVER,
        rotate: ANIMATION_PRESETS.ICON_HOVER.rotate,
        backgroundColor: 'var(--white-opacity-30)',
        transition: ANIMATION_PRESETS.ICON_HOVER.transition
      }}
      whileTap={ANIMATION_PRESETS.ICON_TAP}
    >
      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={{ scale: 0, opacity: 0 }}
        whileHover={{ 
          scale: 1.5, 
          opacity: [0, OPACITY.SHINE, 0],
          transition: { duration: DURATION.SHINE }
        }}
        style={{
          background: `radial-gradient(circle, var(--white-opacity-60) 0%, transparent 70%)`,
        }}
      />
      <motion.span
        className="relative z-10"
        whileHover={{ scale: 1.1 }}
      >
        {children}
      </motion.span>
    </motion.a>
  );
}

