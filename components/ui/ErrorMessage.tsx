/**
 * Error Message Component
 * 
 * Wrapper around AlertMessage for backward compatibility.
 * Use AlertMessage directly for new code.
 */

import AlertMessage from './AlertMessage';

interface ErrorMessageProps {
  message: string | null;
  className?: string;
  'aria-live'?: 'polite' | 'assertive';
}

export default function ErrorMessage(props: ErrorMessageProps) {
  return <AlertMessage {...props} type="error" />;
}
