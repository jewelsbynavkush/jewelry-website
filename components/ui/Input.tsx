import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import FormField from './FormField';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

/**
 * Reusable Input component with consistent styling
 */
export default function Input({ 
  label,
  error,
  required = false,
  className = '',
  id,
  ...props 
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const baseStyles = 'w-full px-4 py-2 border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--text-on-cream)] bg-[var(--cream)] min-h-[44px] text-base';

  return (
    <FormField id={inputId} label={label} error={error} required={required}>
      <input
        id={inputId}
        className={cn(baseStyles, className)}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error && inputId ? `${inputId}-error` : undefined}
        {...props}
      />
    </FormField>
  );
}

