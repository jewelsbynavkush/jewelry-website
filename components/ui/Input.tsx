import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
  const baseStyles = 'w-full px-4 py-2 border border-[#e8e5e0] rounded-lg focus:outline-none focus:border-[#2a2a2a] bg-[#faf8f5] min-h-[44px] text-base';

  return (
    <div>
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-[#2a2a2a] text-body-sm font-medium mb-2 sm:mb-2.5"
        >
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`${baseStyles} ${className}`}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p 
          id={`${inputId}-error`} 
          className="mt-1 text-body-sm text-red-600" 
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

