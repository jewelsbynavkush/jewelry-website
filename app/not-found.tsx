import Button from '@/components/ui/Button';
import PageContainer from '@/components/ui/PageContainer';

export default function NotFound() {
  return (
    <PageContainer maxWidth="md">
      <div className="min-h-[60vh] flex items-center justify-center text-center py-12">
        <div>
          <h1 className="text-6xl sm:text-7xl font-playfair font-bold text-[var(--text-on-cream)] mb-4">
            404
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-on-cream)] mb-3">
            Page not found
          </h2>
          <p className="text-[var(--text-secondary)] text-body-base mb-8 max-w-md mx-auto">
            The page you are looking for does not exist or has been moved.
          </p>
          <Button href="/" aria-label="Go to homepage">
            Back to Home
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
