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
 * ScrollReveal Component
 * 
 * Simple wrapper component for consistent layout structure.
 * Scroll-triggered animations were removed due to iOS Safari performance issues.
 * Deprecated props (delay, direction, stagger) are accepted for backward compatibility but ignored.
 */
export default function ScrollReveal({ 
  children, 
  className = '',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  delay,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  direction,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stagger,
}: ScrollRevealProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
