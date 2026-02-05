/**
 * Reusable Alert Message Component
 * 
 * Displays success, error, warning, or info messages with consistent styling and accessibility.
 * Consolidates SuccessMessage and ErrorMessage into a single reusable component.
 */

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertMessageProps {
  message: string | null;
  type?: AlertType;
  className?: string;
  'aria-live'?: 'polite' | 'assertive';
  autoHide?: boolean;
  onHide?: () => void;
}

/**
 * Get CSS variable for alert type color
 * Uses standardized status colors from design system
 */
function getAlertColor(type: AlertType): string {
  switch (type) {
    case 'success':
      return 'text-[var(--success-text)]';
    case 'error':
      return 'text-[var(--error-text)]';
    case 'warning':
      return 'text-[var(--warning-text)]';
    case 'info':
      return 'text-[var(--info-text)]';
    default:
      return 'text-[var(--text-on-cream)]';
  }
}

export default function AlertMessage({
  message,
  type = 'info',
  className = '',
  'aria-live': ariaLive = 'polite',
  autoHide = false,
  onHide,
}: AlertMessageProps) {
  if (!message) return null;

  // Auto-hide after 3 seconds if enabled
  if (autoHide && onHide) {
    setTimeout(() => {
      onHide();
    }, 3000);
  }

  const colorClass = getAlertColor(type);

  return (
    <div
      className={`${colorClass} text-sm ${className}`}
      role="alert"
      aria-live={ariaLive}
    >
      {message}
    </div>
  );
}
