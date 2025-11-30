'use client';

import AboutImage3D from './AboutImage3D';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

interface AboutUsClientProps {
  aboutImage?: SanityImageSource;
  isMobile?: boolean;
}

/**
 * Client component wrapper for About Us image with 3D effects
 */
export default function AboutUsClient({ aboutImage, isMobile = false }: AboutUsClientProps) {
  return <AboutImage3D aboutImage={aboutImage} isMobile={isMobile} />;
}

