'use client';

/**
 * Profile Page
 * 
 * User profile management with:
 * - Profile editing
 * - Address management
 * - Order history
 * - Password change
 */

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuthStore } from '@/lib/store/auth-store';
import ProfileForm from '@/components/profile/ProfileForm';
import EmailVerification from '@/components/profile/EmailVerification';
import AddressList from '@/components/profile/AddressList';
import OrderHistory from '@/components/profile/OrderHistory';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, fetchProfile, isLoading, user, logout } = useAuthStore();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/auth/login?redirect=/profile');
      return;
    }

    // Only fetch profile if authenticated and user data is missing
    // Prevents multiple calls when isAuthenticated changes
    if (isAuthenticated && !user && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading, router, user]); // fetchProfile intentionally excluded to prevent loops

  if (isLoading) {
    return (
      <PageContainer maxWidth="2xl">
        <SectionHeading as="h2">MY PROFILE</SectionHeading>
        <div className="text-center py-12">
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </PageContainer>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <PageContainer maxWidth="4xl">
      <ScrollReveal>
        <h1 className="sr-only">My Profile - Manage your account settings</h1>
        <SectionHeading as="h2">MY PROFILE</SectionHeading>
      </ScrollReveal>

      <div className="space-y-8 mt-6 sm:mt-8">
        {/* Profile Form */}
        <ScrollReveal delay={0.1}>
          <ProfileForm />
        </ScrollReveal>

        {/* Email Verification */}
        {user?.email && (
          <ScrollReveal delay={0.15}>
            <EmailVerification email={user.email} emailVerified={user.emailVerified} />
          </ScrollReveal>
        )}

        {/* Addresses */}
        <ScrollReveal delay={0.2}>
          <AddressList />
        </ScrollReveal>

        {/* Order History */}
        <ScrollReveal delay={0.3}>
          <OrderHistory />
        </ScrollReveal>

        {/* Logout Section */}
        <ScrollReveal delay={0.4}>
          <Card>
            <div className="space-y-4">
              <div>
                <h3 className="text-[var(--text-on-cream)] text-lg font-semibold mb-2">
                  Account Actions
                </h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  Sign out of your account. You can sign back in anytime.
                </p>
              </div>
              <Button
                onClick={async () => {
                  await logout();
                  router.push('/');
                  router.refresh();
                }}
                className="w-full sm:w-auto min-h-[44px]"
                variant="outline"
                aria-label="Logout"
              >
                LOGOUT
              </Button>
            </div>
          </Card>
        </ScrollReveal>
      </div>
    </PageContainer>
  );
}
