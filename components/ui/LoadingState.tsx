'use client';

import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';

interface LoadingStateProps {
  label?: string;
  className?: string;
  variant?: 'inline' | 'card';
  size?: 'sm' | 'md';
  skeletonLines?: number;
}

export default function LoadingState({
  label = 'Loading',
  className,
  variant = 'card',
  size = 'md',
  skeletonLines = 0,
}: LoadingStateProps) {
  const spinnerSize = size === 'sm' ? 'w-5 h-5 border-2' : 'w-8 h-8 border-4';

  const content = (
    <div className={cn('flex flex-col items-center justify-center text-center', className)}>
      <div
        className={cn(
          'inline-block rounded-full border-[var(--beige)] border-t-transparent animate-spin',
          spinnerSize
        )}
        role="status"
        aria-label={label}
      />

      <div className="mt-3 w-full max-w-sm">
        <p className="text-[var(--text-secondary)] text-sm" aria-live="polite" aria-atomic="true">
          {label}
        </p>

        {skeletonLines > 0 && (
          <div className="mt-4 space-y-3" aria-hidden="true">
            {Array.from({ length: skeletonLines }).map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'loading-shimmer h-3 rounded-md bg-[var(--border-light)]',
                  idx === skeletonLines - 1 ? 'w-2/3' : 'w-full'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (variant === 'inline') return content;

  return (
    <Card className="section-padding-small">
      {content}
    </Card>
  );
}

