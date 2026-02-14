'use client';

export const dynamic = 'force-dynamic';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageContainer from '@/components/ui/PageContainer';
import PageSectionLayout from '@/components/ui/PageSectionLayout';
import ScrollReveal from '@/components/ui/ScrollReveal';
import LoginForm from '@/components/auth/LoginForm';
import { useAuthStore } from '@/lib/store/auth-store';
import LoadingState from '@/components/ui/LoadingState';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const redirect = searchParams.get('redirect') || '/profile';
      const path = redirect.startsWith('/') ? redirect : '/profile';
      router.prefetch(path);
      router.push(path);
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  if (isLoading) {
    return (
      <PageContainer maxWidth="md">
        <LoadingState label="Loading..." />
      </PageContainer>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <PageSectionLayout title="LOGIN" srOnlyTitle="Login to your account" maxWidth="md">
      <ScrollReveal delay={0.1}>
        <LoginForm />
      </ScrollReveal>
    </PageSectionLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <PageContainer maxWidth="md">
          <LoadingState label="Loading..." />
        </PageContainer>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
