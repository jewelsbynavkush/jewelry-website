'use client';

/**
 * Register Form Component
 * 
 * Handles user registration with mobile, name, optional email, and password.
 * Integrates with auth store and API.
 */

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore, RegisterData } from '@/lib/store/auth-store';
import { useFormError } from '@/lib/hooks/useFormError';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import ErrorMessage from '@/components/ui/ErrorMessage';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isLoading, error, clearError } = useAuthStore();
  const { displayError, setError, clearError: clearLocalError } = useFormError({ 
    storeError: error, 
    onErrorClear: clearError 
  });
  
  const [formData, setFormData] = useState<RegisterData>({
    mobile: '',
    countryCode: '+91',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChange = (field: keyof RegisterData | 'confirmPassword', value: string) => {
    if (field === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    clearLocalError();
  };

  const validateForm = (): boolean => {
    if (!formData.mobile.trim()) {
      setError('Mobile number is required');
      return false;
    }

    if (formData.mobile.length < 10) {
      setError('Mobile number must be at least 10 digits');
      return false;
    }

    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }

    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }

    if (!formData.password) {
      setError('Password is required');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearLocalError();

    if (!validateForm()) {
      return;
    }

    const { email, ...requiredData } = formData;
    const registrationData: RegisterData = {
      ...requiredData,
      ...(email && email.trim() ? { email: email.trim() } : {}),
    };

    const response = await register(registrationData);

    if (response.success) {
      // Preserve redirect parameter for post-verification redirect
      const redirect = searchParams.get('redirect');
      const verifyUrl = redirect 
        ? `/auth/verify-mobile?redirect=${encodeURIComponent(redirect)}`
        : '/auth/verify-mobile';
      router.push(verifyUrl);
    } else {
      setError(response.error || 'Registration failed');
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-4">
              <Input
                type="text"
                label="Country Code"
                value={formData.countryCode}
                onChange={(e) => handleChange('countryCode', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="col-span-8">
              <Input
                type="tel"
                label="Mobile Number"
                placeholder="Enter mobile number"
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value.replace(/\D/g, ''))}
                required
                disabled={isLoading}
                aria-label="Mobile number"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="text"
              label="First Name"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              required
              disabled={isLoading}
            />

            <Input
              type="text"
              label="Last Name"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Input
            type="email"
            label="Email (Optional)"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={isLoading}
            aria-label="Email address (optional)"
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter password (min 6 characters)"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            required
            disabled={isLoading}
            minLength={6}
            aria-label="Password"
          />

          <Input
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            required
            disabled={isLoading}
            aria-label="Confirm password"
          />
        </div>

        <ErrorMessage message={displayError} />

        <Button
          type="submit"
          className="w-full min-h-[44px]"
          disabled={isLoading}
          aria-label={isLoading ? 'Registering...' : 'Register'}
        >
          {isLoading ? 'REGISTERING...' : 'REGISTER'}
        </Button>

        <div className="text-center">
          <div className="text-[var(--text-muted)] text-sm">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="text-[var(--text-on-cream)] hover:underline font-medium"
              disabled={isLoading}
            >
              Login
            </button>
          </div>
        </div>
      </form>
    </Card>
  );
}

export default function RegisterForm() {
  return (
    <Suspense fallback={
      <Card>
        <div className="text-center py-12">
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </Card>
    }>
      <RegisterFormContent />
    </Suspense>
  );
}
