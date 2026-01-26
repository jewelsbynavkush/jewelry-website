'use client';

/**
 * Country Code Select Component
 * 
 * Provides a dropdown for selecting country codes with flags and names.
 * Styled consistently with Input component.
 */

import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';
import FormField from './FormField';

export interface CountryCode {
  code: string;
  dialCode: string;
  name: string;
  flag: string;
}

// Only India supported for now
const COMMON_COUNTRIES: CountryCode[] = [
  { code: 'IN', dialCode: '+91', name: 'India', flag: '🇮🇳' },
];

interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  label?: string;
  id?: string;
  error?: string;
}

const CountryCodeSelect = forwardRef<HTMLSelectElement, CountryCodeSelectProps>(
  ({ value, onChange, disabled, required, className = '', label, id, error }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const baseStyles = 'w-full px-4 py-2 border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--text-on-cream)] bg-[var(--cream)] text-[var(--text-on-cream)] min-h-[44px] text-base disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-[url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22/%3E%3C/svg%3E")] bg-no-repeat bg-right bg-[length:20px] pr-10';

    return (
      <FormField id={selectId} label={label} error={error} required={required} className={className}>
        <select
          ref={ref}
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          className={cn(baseStyles)}
          aria-label={label || 'Country code'}
          aria-required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error && selectId ? `${selectId}-error` : undefined}
        >
          {COMMON_COUNTRIES.map((country) => (
            <option key={country.code} value={country.dialCode}>
              {country.flag} {country.dialCode} {country.name}
            </option>
          ))}
        </select>
      </FormField>
    );
  }
);

CountryCodeSelect.displayName = 'CountryCodeSelect';

export default CountryCodeSelect;
