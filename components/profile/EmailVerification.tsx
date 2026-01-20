'use client';

/**
 * Email Verification Component
 * 
 * Displays email verification status and allows:
 * - Verifying email with OTP
 * - Resending email OTP
 * - Shows verification status
 */

import { useState, FormEvent, useRef, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useFormError } from '@/lib/hooks/useFormError';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ErrorMessage from '@/components/ui/ErrorMessage';
import SuccessMessage from '@/components/ui/SuccessMessage';
import OTPInput, { OTPInputRef } from '@/components/ui/OTPInput';

interface EmailVerificationProps {
  email: string;
  emailVerified: boolean;
}

export default function EmailVerification({ email, emailVerified }: EmailVerificationProps) {
  const { verifyEmail, resendEmailOTP, isLoading, error, clearError, fetchProfile } = useAuthStore();
  const { displayError, setError, clearError: clearLocalError } = useFormError({ 
    storeError: error, 
    onErrorClear: clearError 
  });
  
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
    setSuccessMessage(null);

    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    const response = await verifyEmail(otp, email);
    if (response.success) {
      setSuccessMessage('Email verified successfully!');
      fetchProfile(); // Refresh user data in store
    } else {
      setError(response.error || 'Email verification failed.');
    }
  };

  const handleResend = async () => {
    clearLocalError();
    setSuccessMessage(null);
    setResendCooldown(60); // 60 seconds cooldown

    const response = await resendEmailOTP();
    if (response.success) {
      setSuccessMessage('New OTP sent to your email!');
    } else {
      setError(response.error || 'Failed to resend OTP.');
    }
  };

  if (emailVerified) {
    return (
      <Card className="p-4 flex items-center justify-between bg-green-50 border border-green-200">
        <div className="flex items-center space-x-2">
          <svg
            className="h-6 w-6 text-green-600 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-green-800 font-medium">Email ({email}) is verified.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-[var(--text-on-cream)] text-xl font-bold">
            Verify Your Email
          </h3>
          <p className="text-[var(--text-secondary)] text-sm">
            Enter the 6-digit OTP sent to{' '}
            <span className="font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <OTPInput
            ref={otpInputRef}
            value={otp}
            onChange={(value) => {
              setOtp(value);
              clearLocalError();
              setSuccessMessage(null);
            }}
            disabled={isLoading}
            error={displayError}
            autoFocus={!emailVerified}
          />

          <ErrorMessage message={displayError} className="text-center" />
          <SuccessMessage message={successMessage} className="text-center" />

          <Button
            type="submit"
            className="w-full min-h-[44px]"
            disabled={isLoading || otp.length !== 6}
            aria-label={isLoading ? 'Verifying Email...' : 'Verify Email'}
          >
            {isLoading ? 'VERIFYING...' : 'VERIFY EMAIL'}
          </Button>

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={handleResend}
              className={`text-[var(--text-secondary)] text-sm hover:text-[var(--text-on-cream)] underline ${resendCooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading || resendCooldown > 0}
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
