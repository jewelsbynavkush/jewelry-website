'use client';

import { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** @deprecated Kept for backward compatibility, ignored (animations removed) */
  delay?: number;
  /** @deprecated Kept for backward compatibility, ignored (animations removed) */
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';
  /** @deprecated Kept for backward compatibility, ignored (animations removed) */
  stagger?: boolean;
}

/**
 * Simple wrapper component
 * Previously handled scroll-triggered animations (removed for iOS compatibility)
 */
export default function ScrollReveal({ 
  children, 
  className = '',
}: ScrollRevealProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
