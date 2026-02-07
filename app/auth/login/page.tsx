'use client';

export const dynamic = 'force-dynamic';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import LoginForm from '@/components/auth/LoginForm';
import { useAuthStore } from '@/lib/store/auth-store';
import LoadingState from '@/components/ui/LoadingState';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Redirect to profile if already authenticated
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
        <LoadingState label="Loading..." />
      </PageContainer>
    );
  }

  // Don't render login form if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <PageContainer maxWidth="md">
      <ScrollReveal>
        <h1 className="sr-only">Login to your account</h1>
        <SectionHeading as="h2">LOGIN</SectionHeading>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <LoginForm />
      </ScrollReveal>
    </PageContainer>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <PageContainer maxWidth="md">
        <LoadingState label="Loading..." />
      </PageContainer>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
