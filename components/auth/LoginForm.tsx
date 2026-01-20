'use client';

/**
 * Login Form Component
 * 
 * Handles user login with mobile/email and password.
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
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearLocalError();

    if (!identifier.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    const response = await login(identifier.trim(), password);

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
            type="text"
            label="Mobile Number or Email"
            placeholder="Enter mobile number or email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            disabled={isLoading}
            aria-label="Mobile number or email address"
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
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
            className="text-[var(--text-secondary)] text-sm hover:text-[var(--text-on-cream)] underline"
            disabled={isLoading}
          >
            Forgot Password?
          </button>
          <div className="text-[var(--text-muted)] text-sm">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/auth/register')}
              className="text-[var(--text-on-cream)] hover:underline font-medium"
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
