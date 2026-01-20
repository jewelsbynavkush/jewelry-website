/**
 * Reusable Success Message Component
 * 
 * Displays success messages with consistent styling and accessibility
 */

interface SuccessMessageProps {
  message: string | null;
  className?: string;
  'aria-live'?: 'polite' | 'assertive';
  autoHide?: boolean;
  onHide?: () => void;
}

export default function SuccessMessage({ 
  message, 
  className = '',
  'aria-live': ariaLive = 'polite',
  autoHide = false,
  onHide,
}: SuccessMessageProps) {
  if (!message) return null;

  if (autoHide && onHide) {
    setTimeout(() => {
      onHide();
    }, 3000);
  }

  return (
    <div
      className={`text-[var(--success-text)] text-sm ${className}`}
      role="alert"
      aria-live={ariaLive}
    >
      {message}
    </div>
  );
}
