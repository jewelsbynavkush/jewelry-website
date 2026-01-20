'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuthStore } from '@/lib/store/auth-store';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Redirect to profile if already authenticated
    if (isAuthenticated && !isLoading) {
      router.push('/profile');
      router.refresh();
    }
  }, [isAuthenticated, isLoading, router]);

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
