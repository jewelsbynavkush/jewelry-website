'use client';

import Image from 'next/image';
import { urlFor } from '@/lib/cms/client';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

interface HeroImage3DProps {
  heroImage?: SanityImageSource;
  isMobile?: boolean;
}

/**
 * Simple hero image component without any effects
 */
export default function HeroImage3D({ heroImage, isMobile = false }: HeroImage3DProps) {
  const imageUrl = heroImage 
    ? urlFor(heroImage).width(800).height(800).url()
    : '/hero-image.png';
  
  const imageAlt = (typeof heroImage === 'object' && heroImage && 'alt' in heroImage) 
    ? heroImage.alt || 'Jewelry collection'
    : 'Elegant mannequin hand displaying two gold rings - one with rectangular gemstone, one with round brilliant-cut stone';

  const heightClass = isMobile 
    ? 'h-[300px] sm:h-[400px]' 
    : 'h-[400px] lg:h-[500px] xl:h-[600px]';

  return (
    <div
      className={`relative ${heightClass} w-full bg-[#CCC4BA] overflow-hidden`}
      style={{ 
        borderRadius: '8px 8px 0 0', 
        marginBottom: 0, 
        paddingBottom: 0,
      }}
    >
      <Image
        src={imageUrl}
        alt={imageAlt}
        fill
        className="object-contain"
        priority
        sizes={isMobile ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        unoptimized={!heroImage}
        style={{ objectPosition: 'center bottom', borderRadius: '8px 8px 0 0', bottom: 0 }}
      />
    </div>
  );
}
