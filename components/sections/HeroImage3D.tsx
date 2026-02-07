'use client';

import Image from 'next/image';
import { getCDNUrl } from '@/lib/utils/cdn';

interface HeroImage3DProps {
  heroImage?: string;
  heroImageAlt?: string;
  isMobile?: boolean;
}

/**
 * Simple hero image component without any effects
 */
export default function HeroImage3D({ heroImage, heroImageAlt, isMobile = false }: HeroImage3DProps) {
  const imageUrl = getCDNUrl(heroImage || '/assets/hero/hero-image.png');
  
  const imageAlt = heroImageAlt || 'Elegant mannequin hand displaying two gold rings - one with rectangular gemstone, one with round brilliant-cut stone';

  const heightClass = isMobile 
    ? 'h-[300px] sm:h-[400px]' 
    : 'h-[400px] lg:h-[500px] xl:h-[600px]';

  return (
    <div
      className={`relative ${heightClass} w-full bg-[var(--beige)] overflow-hidden rounded-t-lg mb-0 pb-0`}
    >
      <Image
        src={imageUrl}
        alt={imageAlt}
        fill
        className="object-contain object-bottom rounded-t-lg"
        priority
        sizes={isMobile ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
      />
    </div>
  );
}
