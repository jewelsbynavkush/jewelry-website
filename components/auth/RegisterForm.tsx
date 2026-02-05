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
import { validateEmail, validateName, validatePassword, validateMobile } from '@/lib/utils/form-validation';
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
    // Use centralized validation utilities for consistent validation rules across all forms
    // Ensures same validation logic is applied everywhere, reducing bugs and improving maintainability
    
    // Email validation: format, length (max 254 chars), and required field checks
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setError(emailError);
      return false;
    }

    // Name validation: required, max length (50 chars), and character restrictions (letters, spaces, hyphens, apostrophes, dots)
    const firstNameError = validateName(formData.firstName, 'First name');
    if (firstNameError) {
      setError(firstNameError);
      return false;
    }

    const lastNameError = validateName(formData.lastName, 'Last name');
    if (lastNameError) {
      setError(lastNameError);
      return false;
    }

    // Password validation: required, min length (6 chars), max length (100 chars), no spaces
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return false;
    }

    // Password confirmation: must match original password to prevent typos
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Mobile validation: optional field, but if provided must be exactly 10 digits
    const mobileError = validateMobile(formData.mobile || '');
    if (mobileError) {
      setError(mobileError);
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
              className="text-[var(--text-on-cream)] hover:underline font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-colors min-h-[44px] px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--beige)] focus:ring-offset-2 rounded"
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
