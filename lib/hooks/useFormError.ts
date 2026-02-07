/**
 * Reusable Form Error Handling Hook
 * 
 * Provides consistent error handling pattern for forms:
 * - Local error state
 * - Store error state
 * - Error clearing
 * - Combined error display
 */

import { useState, useCallback } from 'react';

interface UseFormErrorOptions {
  storeError?: string | null;
  onErrorClear?: () => void;
}

export function useFormError({ storeError, onErrorClear }: UseFormErrorOptions = {}) {
  const [localError, setLocalError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setLocalError(null);
    onErrorClear?.();
  }, [onErrorClear]);

  const setError = useCallback((error: string | null) => {
    setLocalError(error);
  }, []);

  const displayError = localError || storeError || null;

  return {
    localError,
    displayError,
    setError,
    clearError,
  };
}
