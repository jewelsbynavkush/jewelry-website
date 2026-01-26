import { InputHTMLAttributes, forwardRef } from 'react';
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
const Input = forwardRef<HTMLInputElement, InputProps>(({ 
  label,
  error,
  required = false,
  className = '',
  id,
  ...props 
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const baseStyles = 'w-full px-4 py-2 border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--text-on-cream)] bg-[var(--cream)] text-[var(--text-on-cream)] min-h-[44px] text-base disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <FormField id={inputId} label={label} error={error} required={required}>
      <input
        ref={ref}
        id={inputId}
        className={cn(baseStyles, className)}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error && inputId ? `${inputId}-error` : undefined}
        {...props}
      />
    </FormField>
  );
});

Input.displayName = 'Input';

export default Input;

