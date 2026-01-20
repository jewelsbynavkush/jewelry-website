/**
 * Reusable Error Message Component
 * 
 * Displays error messages with consistent styling and accessibility
 */

interface ErrorMessageProps {
  message: string | null;
  className?: string;
  'aria-live'?: 'polite' | 'assertive';
}

export default function ErrorMessage({ 
  message, 
  className = '',
  'aria-live': ariaLive = 'polite',
}: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      className={`text-[var(--error-text)] text-sm ${className}`}
      role="alert"
      aria-live={ariaLive}
    >
      {message}
    </div>
  );
}
