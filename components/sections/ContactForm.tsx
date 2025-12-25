'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema, ContactFormData } from '@/lib/validations/schemas';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Card from '@/components/ui/Card';

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'same-origin',
      });

      if (!response.ok) {
        setSubmitStatus('error');
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setSubmitStatus('error');
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        setSubmitStatus('success');
        reset();
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="space-y-4 sm:space-y-5 md:space-y-6"
        aria-label="Contact form"
        noValidate
      >
        <Input
          {...register('name')}
          type="text"
          id="name"
          label="Name"
          required
          error={errors.name?.message}
        />

        <Input
          {...register('email')}
          type="email"
          id="email"
          label="Email"
          required
          error={errors.email?.message}
        />

        <Input
          {...register('phone')}
          type="tel"
          id="phone"
          label="Phone"
        />

        <Textarea
          {...register('message')}
          id="message"
          label="Message"
          required
          error={errors.message?.message}
        />

        {submitStatus === 'success' && (
          <div className="p-4 sm:p-5 rounded-lg text-body-sm sm:text-body-base border border-[var(--success-border)]" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }} role="alert" aria-live="polite">
            Thank you! Your message has been sent successfully.
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="p-4 sm:p-5 rounded-lg text-body-sm sm:text-body-base border border-[var(--error-border)]" style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-text)' }} role="alert" aria-live="assertive">
            Something went wrong. Please try again.
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </Card>
  );
}

