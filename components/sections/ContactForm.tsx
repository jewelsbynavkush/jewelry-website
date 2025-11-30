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
        credentials: 'same-origin', // Ensure cookies are sent for same-origin requests
      });

      // Check if response is ok
      if (!response.ok) {
        // Error logged securely on server side, no need to log here
        setSubmitStatus('error');
        return;
      }

      // Validate response is JSON
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
      // Don't expose error details to user
      // Error handling is done on server side
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
          <div className="p-4 bg-green-100 text-green-700 rounded-lg" role="alert" aria-live="polite">
            Thank you! Your message has been sent successfully.
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg" role="alert" aria-live="assertive">
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

