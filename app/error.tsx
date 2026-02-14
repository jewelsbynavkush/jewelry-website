'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import PageContainer from '@/components/ui/PageContainer';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to reporting service in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Route error:', error.message);
    }
  }, [error]);

  return (
    <PageContainer maxWidth="md">
      <div className="min-h-[60vh] flex items-center justify-center text-center py-12">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-on-cream)] mb-4">
            Something went wrong
          </h1>
          <p className="text-[var(--text-secondary)] text-body-base mb-8 max-w-md mx-auto">
            An unexpected error occurred. Please try again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={reset} aria-label="Try again">
              Try again
            </Button>
            <Button href="/" variant="outline" aria-label="Go to homepage">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
