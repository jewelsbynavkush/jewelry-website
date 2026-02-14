'use client';

export const dynamic = 'force-dynamic';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageContainer from '@/components/ui/PageContainer';
import PageSectionLayout from '@/components/ui/PageSectionLayout';
import ScrollReveal from '@/components/ui/ScrollReveal';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuthStore } from '@/lib/store/auth-store';
import LoadingState from '@/components/ui/LoadingState';

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const redirect = searchParams.get('redirect') || '/profile';
      router.push(redirect);
      router.refresh();
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
    <PageSectionLayout title="REGISTER" srOnlyTitle="Create a new account" maxWidth="md">
      <ScrollReveal delay={0.1}>
        <RegisterForm />
      </ScrollReveal>
    </PageSectionLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <PageContainer maxWidth="md">
          <LoadingState label="Loading..." />
        </PageContainer>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
