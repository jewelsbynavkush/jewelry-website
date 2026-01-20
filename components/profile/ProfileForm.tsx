'use client';

/**
 * Profile Form Component
 * 
 * Handles user profile updates:
 * - First name, last name
 * - Email (optional)
 * - Mobile number (read-only)
 */

import { useState, useEffect, FormEvent } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { apiPatch } from '@/lib/api/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import ErrorMessage from '@/components/ui/ErrorMessage';
import SuccessMessage from '@/components/ui/SuccessMessage';

export default function ProfileForm() {
  const { user, fetchProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
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
      const response = await apiPatch<{ user: { id: string; firstName: string; lastName: string; email?: string; mobile: string } }>('/api/users/profile', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        ...(formData.email.trim() ? { email: formData.email.trim() } : {}),
      });

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
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              required
              disabled={isLoading}
            />
            <Input
              type="text"
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Input
            type="tel"
            label="Mobile Number"
            value={user.mobile}
            disabled
            className="opacity-60"
            aria-label="Mobile number (cannot be changed)"
          />

          <Input
            type="email"
            label="Email (Optional)"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={isLoading}
            aria-label="Email address (optional)"
          />
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
