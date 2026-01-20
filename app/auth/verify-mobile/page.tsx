'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import OTPVerificationForm from '@/components/auth/OTPVerificationForm';
import { useAuthStore } from '@/lib/store/auth-store';

export default function VerifyMobilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    // Redirect to profile if authenticated and mobile is already verified
    if (isAuthenticated && !isLoading && user?.mobileVerified) {
      router.push('/profile');
      router.refresh();
    }
  }, [isAuthenticated, isLoading, user, router]);

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

  // Don't render form if authenticated and already verified (will redirect)
  if (isAuthenticated && user?.mobileVerified) {
    return null;
  }

  return (
    <PageContainer maxWidth="md">
      <ScrollReveal>
        <h1 className="sr-only">Verify mobile number with OTP</h1>
        <SectionHeading as="h2">VERIFY MOBILE</SectionHeading>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <OTPVerificationForm />
      </ScrollReveal>
    </PageContainer>
  );
}
