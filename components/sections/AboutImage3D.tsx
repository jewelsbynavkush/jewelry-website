'use client';

import Image from 'next/image';
import { urlFor } from '@/lib/cms/client';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

interface AboutImage3DProps {
  aboutImage?: SanityImageSource;
  isMobile?: boolean;
}

/**
 * Simple about us image component without any effects
 */
export default function AboutImage3D({ aboutImage, isMobile = false }: AboutImage3DProps) {
  const imageUrl = aboutImage 
    ? urlFor(aboutImage).width(800).height(800).url()
    : '/about-image.png';
  
  const imageAlt = (typeof aboutImage === 'object' && aboutImage && 'alt' in aboutImage) 
    ? aboutImage.alt || 'About Jewels by NavKush - Our craftsmanship and dedication to creating timeless jewelry'
    : 'About Jewels by NavKush - Our craftsmanship and dedication to creating timeless jewelry';

  const heightClass = isMobile 
    ? 'h-[300px] sm:h-[400px]' 
    : 'h-[400px] lg:h-[450px] xl:h-[500px]';

  return (
    <div
      className={`relative ${heightClass} w-full bg-[#CCC4BA]`}
      style={{ 
        borderTopLeftRadius: '40px', 
        paddingTop: isMobile ? '12px' : '16px', 
        paddingLeft: isMobile ? '12px' : '16px',
      }}
    >
      <div 
        className="relative h-full w-full overflow-hidden" 
        style={{ borderTopLeftRadius: '40px' }}
      >
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-cover object-top"
          sizes={isMobile ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 50vw"}
          unoptimized={!aboutImage}
        />
      </div>
    </div>
  );
}
