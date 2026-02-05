/**
 * Success Message Component
 * 
 * Wrapper around AlertMessage for backward compatibility.
 * Use AlertMessage directly for new code.
 */

import AlertMessage from './AlertMessage';

interface SuccessMessageProps {
  message: string | null;
  className?: string;
  'aria-live'?: 'polite' | 'assertive';
  autoHide?: boolean;
  onHide?: () => void;
}

export default function SuccessMessage(props: SuccessMessageProps) {
  return <AlertMessage {...props} type="success" />;
}
