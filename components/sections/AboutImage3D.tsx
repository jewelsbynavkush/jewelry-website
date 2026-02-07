'use client';

import Image from 'next/image';
import { getCDNUrl } from '@/lib/utils/cdn';

interface AboutImage3DProps {
  aboutImage?: string;
  aboutImageAlt?: string;
  isMobile?: boolean;
}

/**
 * Simple about us image component without any effects
 */
export default function AboutImage3D({ aboutImage, aboutImageAlt, isMobile = false }: AboutImage3DProps) {
  const imageUrl = getCDNUrl(aboutImage || '/assets/about/about-image.png');
  
  const imageAlt = aboutImageAlt || 'About Jewels by NavKush - Our craftsmanship and dedication to creating timeless jewelry';

  const heightClass = isMobile 
    ? 'h-[300px] sm:h-[400px]' 
    : 'h-[400px] lg:h-[450px] xl:h-[500px]';

  return (
    <div
      className={`relative ${heightClass} w-full bg-[var(--beige)] rounded-tl-[40px] pt-3 sm:pt-4 pl-3 sm:pl-4`}
    >
      <div 
        className="relative h-full w-full overflow-hidden rounded-tl-[40px]"
      >
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-cover object-top"
          sizes={isMobile ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 50vw"}
        />
      </div>
    </div>
  );
}
