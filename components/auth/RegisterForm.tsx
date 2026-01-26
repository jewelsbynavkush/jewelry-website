'use client';

/**
 * Register Form Component
 * 
 * Handles user registration with email (required), name, optional mobile, and password.
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
import CountryCodeSelect from '@/components/ui/CountryCodeSelect';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isLoading, error, clearError } = useAuthStore();
  const { displayError, setError, clearError: clearLocalError } = useFormError({ 
    storeError: error, 
    onErrorClear: clearError 
  });
  
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    firstName: '',
    lastName: '',
    mobile: '',
    countryCode: '+91',
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
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }

    if (formData.email.length > 254) {
      setError('Email must not exceed 254 characters');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }

    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }

    if (formData.firstName.length > 50) {
      setError('First name must not exceed 50 characters');
      return false;
    }

    if (!/^[a-zA-Z\s\-'\.]+$/.test(formData.firstName)) {
      setError('First name can only contain letters, spaces, hyphens, apostrophes, and dots');
      return false;
    }

    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }

    if (formData.lastName.length > 50) {
      setError('Last name must not exceed 50 characters');
      return false;
    }

    if (!/^[a-zA-Z\s\-'\.]+$/.test(formData.lastName)) {
      setError('Last name can only contain letters, spaces, hyphens, apostrophes, and dots');
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

    if (formData.password.length > 100) {
      setError('Password must not exceed 100 characters');
      return false;
    }

    if (/\s/.test(formData.password)) {
      setError('Password cannot contain spaces');
      return false;
    }

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Validate mobile if provided
    if (formData.mobile && formData.mobile.trim()) {
      if (!/^[0-9]{10}$/.test(formData.mobile.trim())) {
        setError('Mobile number must be exactly 10 digits');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearLocalError();

    if (!validateForm()) {
      return;
    }

    const registrationData: RegisterData = {
      email: formData.email.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      password: formData.password,
      ...(formData.mobile && formData.mobile.trim() ? { 
        mobile: formData.mobile.trim(),
        countryCode: formData.countryCode 
      } : {}),
    };

    const response = await register(registrationData);

    if (response.success) {
      // Preserve redirect parameter for post-verification redirect
      const redirect = searchParams.get('redirect');
      const verifyUrl = redirect 
        ? `/auth/verify-email?redirect=${encodeURIComponent(redirect)}`
        : '/auth/verify-email';
      router.push(verifyUrl);
    } else {
      setError(response.error || 'Registration failed');
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            disabled={isLoading}
            maxLength={254}
            aria-label="Email address"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              type="text"
              label="First Name"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z\s\-'\.]/g, '');
                handleChange('firstName', value);
              }}
              required
              disabled={isLoading}
              maxLength={50}
            />

            <Input
              type="text"
              label="Last Name"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z\s\-'\.]/g, '');
                handleChange('lastName', value);
              }}
              required
              disabled={isLoading}
              maxLength={50}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <CountryCodeSelect
                value={formData.countryCode || '+91'}
                onChange={(value) => handleChange('countryCode', value)}
                disabled={isLoading}
                label="Country Code"
              />
            </div>
            <div className="sm:col-span-8">
              <Input
                type="tel"
                label="Mobile Number (Optional)"
                placeholder="Enter mobile number"
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value.replace(/\D/g, ''))}
                disabled={isLoading}
                aria-label="Mobile number (optional)"
                maxLength={10}
              />
            </div>
          </div>

          <Input
            type="password"
            label="Password"
            placeholder="Enter password (min 6 characters)"
            value={formData.password}
            onChange={(e) => {
              const value = e.target.value.replace(/\s/g, '');
              handleChange('password', value);
            }}
            required
            disabled={isLoading}
            minLength={6}
            maxLength={100}
            aria-label="Password"
          />

          <Input
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => {
              const value = e.target.value.replace(/\s/g, '');
              handleChange('confirmPassword', value);
            }}
            required
            disabled={isLoading}
            minLength={6}
            maxLength={100}
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
              className="text-[var(--text-on-cream)] hover:underline font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
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
