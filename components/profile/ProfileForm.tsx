'use client';

/**
 * Profile Form Component
 * 
 * Handles user profile updates:
 * - First name, last name
 * - Email (non-editable if verified)
 * - Mobile number (editable)
 */

import { useState, useEffect, FormEvent } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { apiPatch } from '@/lib/api/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import ErrorMessage from '@/components/ui/ErrorMessage';
import SuccessMessage from '@/components/ui/SuccessMessage';
import CountryCodeSelect from '@/components/ui/CountryCodeSelect';
import { validateName, validateEmail, validateMobile } from '@/lib/utils/form-validation';

export default function ProfileForm() {
  const { user, fetchProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    countryCode: '+91',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        mobile: user.mobile || '',
        countryCode: user.countryCode || '+91',
      });
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      // Use centralized validation utilities for consistent validation
      const firstNameError = validateName(formData.firstName, 'First name');
      if (firstNameError) {
        setError(firstNameError);
        setIsLoading(false);
        return;
      }

      const lastNameError = validateName(formData.lastName, 'Last name');
      if (lastNameError) {
        setError(lastNameError);
        setIsLoading(false);
        return;
      }

      // Validate email if provided and not verified
      if (!user?.emailVerified && formData.email.trim()) {
        const emailError = validateEmail(formData.email);
        if (emailError) {
          setError(emailError);
          setIsLoading(false);
          return;
        }
      }

      // Validate mobile if provided
      if (formData.mobile && formData.mobile.trim()) {
        const mobileError = validateMobile(formData.mobile);
        if (mobileError) {
          setError(mobileError);
          setIsLoading(false);
          return;
        }
      }

      // Only include email in request if email is not verified (email field is disabled if verified)
      const requestData: {
        firstName: string;
        lastName: string;
        mobile?: string;
        countryCode?: string;
        email?: string;
      } = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        ...(formData.mobile.trim() ? { 
          mobile: formData.mobile.trim(),
          countryCode: formData.countryCode 
        } : {}),
      };

      // Only include email if not verified (email is disabled in UI if verified, but add extra safety)
      if (!user?.emailVerified && formData.email.trim()) {
        requestData.email = formData.email.trim();
      }

      const response = await apiPatch<{ user: { id: string; firstName: string; lastName: string; email?: string; mobile?: string; countryCode?: string } }>('/api/users/profile', requestData);

      if (response.success) {
        setSuccess(true);
        await fetchProfile();
        
        // If email was changed and is now unverified, show message
        const user = response.data?.user as { email?: string; emailVerified?: boolean } | undefined;
        if (user && user.email && !user.emailVerified) {
          setError('Profile updated! Please verify your email address.');
        }
        
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(response.error || 'Failed to update profile');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <p className="text-[var(--text-secondary)] text-center py-8">
          Loading profile...
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="text"
              label="First Name"
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
                value={formData.countryCode}
                onChange={(value) => handleChange('countryCode', value)}
                disabled={isLoading}
                label="Country Code"
              />
            </div>
            <div className="sm:col-span-8">
              <Input
                type="tel"
                label="Mobile Number (Optional)"
                placeholder="Enter 10-digit mobile number"
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value.replace(/\D/g, ''))}
                disabled={isLoading}
                maxLength={10}
                aria-label="Mobile number (optional)"
              />
            </div>
          </div>

          <Input
            type="email"
            label="Email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={isLoading || (user?.emailVerified === true)}
            className={user?.emailVerified ? 'opacity-60' : ''}
            aria-label={user?.emailVerified ? 'Email address (verified, cannot be changed)' : 'Email address'}
            required
          />
          {user?.emailVerified && (
            <p className="text-[var(--text-secondary)] text-xs -mt-2">
              Email is verified and cannot be changed
            </p>
          )}
        </div>

        <ErrorMessage message={error} />
        <SuccessMessage 
          message={success ? 'Profile updated successfully!' : null}
          autoHide
          onHide={() => setSuccess(false)}
        />

        <Button
          type="submit"
          className="w-full min-h-[44px]"
          disabled={isLoading}
          aria-label={isLoading ? 'Saving changes...' : 'Save changes'}
        >
          {isLoading ? 'SAVING...' : 'SAVE CHANGES'}
        </Button>
      </form>
    </Card>
  );
}
