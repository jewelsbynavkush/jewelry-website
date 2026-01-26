'use client';

/**
 * Login Form Component
 * 
 * Handles user login with email and password.
 * Integrates with auth store and API.
 */

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useFormError } from '@/lib/hooks/useFormError';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { displayError, setError, clearError: clearLocalError } = useFormError({ 
    storeError: error, 
    onErrorClear: clearError 
  });
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearLocalError();

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
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

    if (password.length > 100) {
      setError('Password must not exceed 100 characters');
      return;
    }

    const response = await login(email.trim(), password);

    if (response.success) {
      // Redirect to original destination or profile
      const redirect = searchParams.get('redirect') || '/profile';
      router.push(redirect);
      router.refresh();
    } else {
      setError(response.error || 'Login failed');
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="space-y-4">
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

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              const value = e.target.value.replace(/\s/g, '');
              setPassword(value);
            }}
            required
            disabled={isLoading}
            maxLength={100}
            aria-label="Password"
          />
        </div>

        <ErrorMessage message={displayError} />

        <Button
          type="submit"
          className="w-full min-h-[44px]"
          disabled={isLoading}
          aria-label={isLoading ? 'Logging in...' : 'Login'}
        >
          {isLoading ? 'LOGGING IN...' : 'LOGIN'}
        </Button>

        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={() => router.push('/auth/reset-password')}
            className="text-[var(--text-secondary)] text-sm hover:text-[var(--text-on-cream)] underline cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            disabled={isLoading}
          >
            Forgot Password?
          </button>
          <div className="text-[var(--text-muted)] text-sm">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/auth/register')}
              className="text-[var(--text-on-cream)] hover:underline font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              disabled={isLoading}
            >
              Register
            </button>
          </div>
        </div>
      </form>
    </Card>
  );
}
