'use client';

import { ReactNode } from 'react';

/**
 * Provider component (scroll behavior removed for iOS compatibility)
 */
export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
