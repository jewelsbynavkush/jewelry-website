'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { getCDNUrl } from '@/lib/utils/cdn';

const SWIPE_THRESHOLD = 50;

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
  variant?: 'card' | 'detail';
  priority?: boolean;
  className?: string;
  /** When true, button/dot clicks do not bubble (e.g. when gallery is inside a Link) */
  stopPropagation?: boolean;
}

export default function ProductImageGallery({
  images,
  alt,
  variant = 'detail',
  priority = false,
  className = '',
  stopPropagation = false,
}: ProductImageGalleryProps) {
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const count = images.length;
  const hasMultiple = count > 1;

  const goPrev = useCallback(() => {
    setIndex((i) => (i <= 0 ? count - 1 : i - 1));
  }, [count]);

  const goNext = useCallback(() => {
    setIndex((i) => (i >= count - 1 ? 0 : i + 1));
  }, [count]);

  const handleInteraction = useCallback(
    (e: React.MouseEvent) => {
      if (stopPropagation) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [stopPropagation]
  );

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStart === null || !hasMultiple) return;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = touchStart.x - endX;
      const deltaY = touchStart.y - endY;
      const isHorizontalSwipe = Math.abs(deltaX) >= Math.abs(deltaY) && Math.abs(deltaX) >= SWIPE_THRESHOLD;
      if (isHorizontalSwipe) {
        if (deltaX > 0) goNext();
        else goPrev();
      }
      setTouchStart(null);
    },
    [touchStart, hasMultiple, goPrev, goNext]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!hasMultiple) return;
      if (e.key === 'ArrowLeft') {
        goPrev();
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        goNext();
        e.preventDefault();
      }
    },
    [hasMultiple, goPrev, goNext]
  );

  if (!images.length) return null;

  const singleImage = images[0];
  const currentImage = images[index] ?? singleImage;
  const imageUrl = getCDNUrl(currentImage);

  const isCard = variant === 'card';
  const containerHeight = isCard
    ? 'h-full min-h-0'
    : 'h-64 sm:h-80 md:h-96 lg:h-[500px]';

  return (
    <div
      className={`relative w-full ${containerHeight} rounded-lg overflow-hidden bg-[var(--cream)] select-none ${className}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onKeyDown={onKeyDown}
      role={hasMultiple ? 'region' : undefined}
      aria-label={hasMultiple ? 'Product image gallery' : undefined}
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(135deg, var(--gradient-beige-light) 0%, var(--gradient-cream-light) 50%, var(--gradient-beige-light) 100%)`,
        }}
      />
      <div className={`relative w-full h-full z-10 ${isCard ? 'p-0' : 'p-4 sm:p-6 md:p-8'}`}>
        <Image
          src={imageUrl}
          alt={count > 1 ? `${alt} — image ${index + 1} of ${count}` : alt}
          fill
          className={isCard ? 'object-cover mix-blend-multiply' : 'object-contain mix-blend-multiply'}
          priority={priority && index === 0}
          sizes={isCard ? '(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw' : '(max-width: 768px) 100vw, 50vw'}
        />
      </div>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(e) => {
              handleInteraction(e);
              goPrev();
            }}
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/20 hover:bg-black/35 active:bg-black/45 flex items-center justify-center text-white transition-colors touch-manipulation"
            aria-label="Previous image"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              handleInteraction(e);
              goNext();
            }}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/20 hover:bg-black/35 active:bg-black/45 flex items-center justify-center text-white transition-colors touch-manipulation"
            aria-label="Next image"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2" role="tablist" aria-label="Image gallery">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Image ${i + 1}`}
                onClick={(e) => {
                  handleInteraction(e);
                  setIndex(i);
                }}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-colors touch-manipulation ${
                  i === index ? 'bg-black/70 scale-110' : 'bg-black/30 hover:bg-black/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
