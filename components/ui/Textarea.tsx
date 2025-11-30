import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
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
  const baseStyles = 'w-full px-4 py-3 sm:py-2.5 border border-[#e8e5e0] rounded-lg focus:outline-none focus:border-[#2a2a2a] bg-[#faf8f5] min-h-[120px] text-base resize-y';

  return (
    <div>
      {label && (
        <label 
          htmlFor={textareaId} 
          className="block text-body-sm font-medium text-[#2a2a2a] mb-2 sm:mb-2.5"
        >
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`${baseStyles} ${className}`}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        {...props}
      />
      {error && (
        <p 
          id={`${textareaId}-error`} 
          className="mt-1 text-sm text-red-600" 
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

