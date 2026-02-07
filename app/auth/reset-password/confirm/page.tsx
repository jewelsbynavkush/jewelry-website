'use client';

export const dynamic = 'force-dynamic';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LoadingState from '@/components/ui/LoadingState';
import ErrorMessage from '@/components/ui/ErrorMessage';
import SuccessMessage from '@/components/ui/SuccessMessage';
import { useAuthStore } from '@/lib/store/auth-store';
import { useFormError } from '@/lib/hooks/useFormError';

function ConfirmResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirmResetPassword, isLoading, error, clearError } = useAuthStore();
  const { displayError, setError, clearError: clearLocalError } = useFormError({ 
    storeError: error, 
    onErrorClear: clearError 
  });
  
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Extract password reset token from URL query parameter
    // Token is sent via email link and must be present to allow password reset
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      // Use setTimeout to avoid setState in effect warning
      setTimeout(() => {
        setToken(tokenParam);
      }, 0);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearLocalError();
    setSuccess(false);

    if (!token) {
      setError('Reset token is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password.length > 100) {
      setError('Password must not exceed 100 characters');
      return;
    }

    if (/\s/.test(password)) {
      setError('Password cannot contain spaces');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const response = await confirmResetPassword(token, password);
    if (response.success) {
      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } else {
      setError(response.error || 'Failed to reset password');
    }
  };

  return (
    <PageContainer maxWidth="md">
      <ScrollReveal>
        <h1 className="sr-only">Confirm password reset</h1>
        <SectionHeading as="h2">RESET PASSWORD</SectionHeading>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <Card>
          <div className="space-y-6">
            {success ? (
              <div className="space-y-4">
                <SuccessMessage message="Password reset successfully! Redirecting to login..." />
              </div>
            ) : (
              <>
                <div className="text-center space-y-2">
                  <p className="text-[var(--text-secondary)] text-sm">
                    Enter your new password to complete the reset process.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    type="text"
                    label="Reset Token"
                    placeholder="Enter reset token from email/SMS"
                    value={token}
                    onChange={(e) => {
                      setToken(e.target.value);
                      clearLocalError();
                    }}
                    required
                    disabled={isLoading}
                    aria-label="Password reset token"
                  />

                  <Input
                    type="password"
                    label="New Password"
                    placeholder="Enter new password (min 6 characters)"
                    value={password}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '');
                      setPassword(value);
                      clearLocalError();
                    }}
                    required
                    disabled={isLoading}
                    minLength={6}
                    maxLength={100}
                    aria-label="New password"
                  />

                  <Input
                    type="password"
                    label="Confirm Password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '');
                      setConfirmPassword(value);
                      clearLocalError();
                    }}
                    required
                    disabled={isLoading}
                    minLength={6}
                    maxLength={100}
                    aria-label="Confirm new password"
                  />

                  <ErrorMessage message={displayError} />

                  <Button
                    type="submit"
                    className="w-full min-h-[44px]"
                    disabled={isLoading || !token || !password || !confirmPassword}
                    aria-label={isLoading ? 'Resetting password...' : 'Reset Password'}
                  >
                    {isLoading ? 'RESETTING...' : 'RESET PASSWORD'}
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

export default function ConfirmResetPasswordPage() {
  return (
    <Suspense fallback={
      <PageContainer maxWidth="md">
        <LoadingState label="Loading..." />
      </PageContainer>
    }>
      <ConfirmResetPasswordContent />
    </Suspense>
  );
}
