'use client';

/**
 * OTP Verification Form Component
 * 
 * Handles email OTP verification after registration.
 * Integrates with auth store and API.
 */

import { useState, FormEvent, useRef, useEffect, Suspense } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useFormError } from '@/lib/hooks/useFormError';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ErrorMessage from '@/components/ui/ErrorMessage';
import OTPInput, { OTPInputRef } from '@/components/ui/OTPInput';

function OTPVerificationFormContent() {
  const { verifyEmail, resendOTP, isLoading, error, clearError, user } = useAuthStore();
  const { displayError, setError, clearError: clearLocalError } = useFormError({ 
    storeError: error, 
    onErrorClear: clearError 
  });
  
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRef = useRef<OTPInputRef>(null);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearLocalError();

    if (otp.length !== 6) {
      setError('Please enter 6-digit OTP');
      return;
    }

    // Always pass email from store (auth store will use it if token is expired)
    // This ensures verification works even if the session token expired
    const response = await verifyEmail(otp, user?.email);

    if (response.success) {
      // Dispatch event to notify verify-email page that verification succeeded
      // This prevents the page from redirecting back
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('otp:verification-success'));
      }
      
      // Wait for auth state to fully update before redirecting
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Always redirect to profile page after successful email verification
      // Use window.location for reliable navigation
      window.location.href = '/profile';
    } else {
      setError(response.error || 'OTP verification failed');
      // Clear OTP on error
      otpInputRef.current?.clear();
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    clearLocalError();
    
    // Include email from store for post-registration flow
    const response = await resendOTP(user?.email);
    
    if (response.success) {
      setResendCooldown(60); // 60 second cooldown
    } else {
      setError(response.error || 'Failed to resend OTP');
    }
  };

  return (
    <Card>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-[var(--text-on-cream)] text-xl font-bold">
            Verify Email Address
          </h3>
          <p className="text-[var(--text-secondary)] text-sm">
            Enter the 6-digit OTP sent to{' '}
            <span className="font-medium">
              {user?.email || 'your email address'}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <OTPInput
            ref={otpInputRef}
            value={otp}
            onChange={(value) => {
              setOtp(value);
              clearLocalError();
            }}
            disabled={isLoading}
            error={displayError}
          />

          <ErrorMessage message={displayError} className="text-center" />

          <Button
            type="submit"
            className="w-full min-h-[44px]"
            disabled={isLoading || otp.length !== 6}
            aria-label={isLoading ? 'Verifying OTP...' : 'Verify OTP'}
          >
            {isLoading ? 'VERIFYING...' : 'VERIFY OTP'}
          </Button>

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading || resendCooldown > 0}
              className="text-[var(--text-secondary)] text-sm hover:text-[var(--text-on-cream)] underline cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {resendCooldown > 0
                ? `Resend OTP in ${resendCooldown}s`
                : 'Resend OTP'}
            </button>
          </div>
        </form>
      </div>
    </Card>
  );
}

export default function OTPVerificationForm() {
  return (
    <Suspense fallback={
      <Card>
        <div className="text-center py-12">
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </Card>
    }>
      <OTPVerificationFormContent />
    </Suspense>
  );
}
