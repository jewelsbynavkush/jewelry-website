import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface FormFieldProps {
  id?: string;
  label?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Reusable FormField wrapper component
 * Provides consistent label, error handling, and accessibility for form inputs
 */
export default function FormField({
  id,
  label,
  error,
  required = false,
  children,
  className = '',
}: FormFieldProps) {
  const fieldId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={cn('', className)}>
      {label && (
        <label 
          htmlFor={fieldId} 
          className="block text-[var(--text-on-cream)] text-body-sm font-medium mb-2 sm:mb-2.5"
        >
          {label} {required && <span className="text-[var(--required-indicator)]">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p 
          id={fieldId ? `${fieldId}-error` : undefined} 
          className="mt-1 text-body-sm text-[var(--error-text)]" 
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

