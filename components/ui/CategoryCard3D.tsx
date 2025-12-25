'use client';

import Link from 'next/link';
import Image from 'next/image';

interface CategoryCard3DProps {
  name: string;
  href: string;
  imageSrc: string;
}

/**
 * Category card component (animations removed for iOS scroll compatibility)
 */
export default function CategoryCard3D({ 
  name, 
  href, 
  imageSrc
}: CategoryCard3DProps) {
  return (
    <div className="group">
      <Link href={href} aria-label={`View ${name} collection`}>
        <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 rounded-lg overflow-hidden mb-3 sm:mb-4 bg-[var(--cream)] p-2 sm:p-3 md:p-4">
          {/* Gradient background */}
          <div 
            className="absolute inset-0 z-0"
            style={{
              background: `linear-gradient(135deg, var(--gradient-beige-light) 0%, var(--gradient-cream-light) 50%, var(--gradient-beige-light) 100%)`,
            }}
          />
          
          <div className="relative w-full h-full z-10">
            <Image
              src={imageSrc}
              alt={`${name} collection`}
              fill
              className="object-contain mix-blend-multiply relative z-10"
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-[var(--text-on-cream)] text-base sm:text-lg md:text-xl uppercase font-playfair font-bold">
            {name}
          </h3>
        </div>
      </Link>
    </div>
  );
}
