'use client';

import Link from 'next/link';
import Image from 'next/image';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';

import { CategoryImageSource, CategoryType } from '@/lib/utils/image-helpers';

interface CategoryImage3DProps {
  category: CategoryType;
  imageSource: CategoryImageSource | null;
}

/**
 * Category image component (animations removed for iOS scroll compatibility)
 */
export default function CategoryImage3D({ category, imageSource }: CategoryImage3DProps) {
  return (
    <div className="relative flex-1 flex items-center justify-center my-8 md:my-12 p-2 sm:p-3 md:p-4">
      <Link 
        href={category.href} 
        className="relative w-full max-w-md cursor-pointer"
        aria-label={`View ${category.name} collection`}
      >
        {imageSource ? (
          <div className="relative w-full aspect-square rounded-lg overflow-hidden">
            {/* Gradient background */}
            <div 
              className="absolute inset-0 z-0"
              style={{
                background: `linear-gradient(135deg, var(--gradient-beige-light) 0%, var(--gradient-cream-light) 50%, var(--gradient-beige-light) 100%)`,
              }}
            />
            
            {/* Image container */}
            <div className="relative w-full h-full z-10">
              <Image
                src={imageSource.src}
                alt={imageSource.alt || `${category.name} jewelry collection - Exquisite handcrafted ${category.name.toLowerCase()} pieces`}
                fill
                className="object-contain mix-blend-multiply relative z-10"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized={false}
              />
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md aspect-square rounded-lg overflow-hidden">
            <ImagePlaceholder text={`${category.name} image`} />
          </div>
        )}
      </Link>
    </div>
  );
}
