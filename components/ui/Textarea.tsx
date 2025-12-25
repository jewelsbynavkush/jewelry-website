import { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import FormField from './FormField';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

/**
 * Reusable Textarea component with consistent styling
 */
export default function Textarea({ 
  label,
  error,
  required = false,
  className = '',
  id,
  rows = 5,
  ...props 
}: TextareaProps) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const baseStyles = 'w-full px-4 py-3 border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--text-on-cream)] bg-[var(--cream)] min-h-[120px] text-base resize-y';

  return (
    <FormField id={textareaId} label={label} error={error} required={required}>
      <textarea
        id={textareaId}
        rows={rows}
        className={cn(baseStyles, className)}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error && textareaId ? `${textareaId}-error` : undefined}
        {...props}
      />
    </FormField>
  );
}

