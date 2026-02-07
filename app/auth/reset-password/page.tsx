'use client';

export const dynamic = 'force-dynamic';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import SuccessMessage from '@/components/ui/SuccessMessage';
import { useAuthStore } from '@/lib/store/auth-store';
import { useFormError } from '@/lib/hooks/useFormError';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  const { displayError, setError, clearError: clearLocalError } = useFormError({ 
    storeError: error, 
    onErrorClear: clearError 
  });
  
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearLocalError();
    setSuccess(false);

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (email.length > 254) {
      setError('Email must not exceed 254 characters');
      return;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    const response = await resetPassword(email.trim());
    if (response.success) {
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } else {
      setError(response.error || 'Failed to request password reset');
    }
  };

  return (
    <PageContainer maxWidth="md">
      <ScrollReveal>
        <h1 className="sr-only">Reset your password</h1>
        <SectionHeading as="h2">RESET PASSWORD</SectionHeading>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <Card>
          <div className="space-y-6">
            {success ? (
              <div className="space-y-4">
                <SuccessMessage message="If an account exists with this email, a password reset link has been sent. Please check your email." />
                <p className="text-[var(--text-secondary)] text-sm text-center">
                  Redirecting to login page...
                </p>
              </div>
            ) : (
              <>
                <div className="text-center space-y-2">
                  <p className="text-[var(--text-secondary)] text-sm">
                    Enter your email address to receive a password reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    type="email"
                    label="Email Address"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearLocalError();
                    }}
                    required
                    disabled={isLoading}
                    maxLength={254}
                    aria-label="Email address"
                  />

                  <ErrorMessage message={displayError} />

                  <Button
                    type="submit"
                    className="w-full min-h-[44px]"
                    disabled={isLoading || !email.trim()}
                    aria-label={isLoading ? 'Sending reset link...' : 'Send Reset Link'}
                  >
                    {isLoading ? 'SENDING...' : 'SEND RESET LINK'}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => router.push('/auth/login')}
                      className="text-[var(--text-secondary)] text-sm hover:text-[var(--text-on-cream)] underline cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                      disabled={isLoading}
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </Card>
      </ScrollReveal>
    </PageContainer>
  );
}
