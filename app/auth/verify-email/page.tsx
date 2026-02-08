'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import OTPVerificationForm from '@/components/auth/OTPVerificationForm';
import { useAuthStore } from '@/lib/store/auth-store';
import LoadingState from '@/components/ui/LoadingState';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const hasJustVerifiedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading && user?.emailVerified) {
      if (typeof window !== 'undefined' &&
          window.location.pathname === '/auth/verify-email' &&
          !hasJustVerifiedRef.current) {
        router.prefetch('/profile');
        router.replace('/profile');
      }
    }
    if (hasJustVerifiedRef.current) {
      const timer = setTimeout(() => {
        hasJustVerifiedRef.current = false;
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, user?.emailVerified, router]);
  
  // Listen for successful verification to set the flag
  useEffect(() => {
    const handleVerificationSuccess = () => {
      hasJustVerifiedRef.current = true;
    };
    
    // Listen for custom event from OTP form
    window.addEventListener('otp:verification-success', handleVerificationSuccess);
    
    return () => {
      window.removeEventListener('otp:verification-success', handleVerificationSuccess);
    };
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <PageContainer maxWidth="md">
        <LoadingState label="Loading..." />
      </PageContainer>
    );
  }

  // Don't render form if authenticated and already verified (will redirect)
  if (isAuthenticated && user?.emailVerified) {
    return null;
  }

  return (
    <PageContainer maxWidth="md">
      <ScrollReveal>
        <h1 className="sr-only">Verify email address with OTP</h1>
        <SectionHeading as="h2">VERIFY EMAIL</SectionHeading>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <OTPVerificationForm />
      </ScrollReveal>
    </PageContainer>
  );
}
