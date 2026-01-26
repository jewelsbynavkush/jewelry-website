'use client';

export const dynamic = 'force-dynamic';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuthStore } from '@/lib/store/auth-store';

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Redirect to profile (or redirect param) if already authenticated
    if (isAuthenticated && !isLoading) {
      const redirect = searchParams.get('redirect') || '/profile';
      router.push(redirect);
      router.refresh();
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <PageContainer maxWidth="md">
        <div className="text-center py-12">
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </PageContainer>
    );
  }

  // Don't render register form if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <PageContainer maxWidth="md">
      <ScrollReveal>
        <h1 className="sr-only">Create a new account</h1>
        <SectionHeading as="h2">REGISTER</SectionHeading>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <RegisterForm />
      </ScrollReveal>
    </PageContainer>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <PageContainer maxWidth="md">
        <div className="text-center py-12">
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </PageContainer>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
