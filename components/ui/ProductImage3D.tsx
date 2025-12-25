'use client';

import Image from 'next/image';

interface ProductImage3DProps {
  image: string;
  alt: string;
  priority?: boolean;
}

/**
 * Product detail image component (animations removed for iOS scroll compatibility)
 */
export default function ProductImage3D({ image, alt, priority = false }: ProductImage3DProps) {
  return (
    <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-lg overflow-hidden bg-[var(--cream)] p-4 sm:p-6 md:p-8">
      {/* Gradient background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(135deg, var(--gradient-beige-light) 0%, var(--gradient-cream-light) 50%, var(--gradient-beige-light) 100%)`,
        }}
      />
      
      <div className="relative w-full h-full z-10">
        <Image
          src={image}
          alt={alt}
          fill
          className="object-contain mix-blend-multiply relative z-10"
          priority={priority}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  );
}
