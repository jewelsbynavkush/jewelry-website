'use client';

/**
 * OTP Input Component
 * 
 * Reusable 6-digit OTP input with:
 * - Auto-advance cursor on input
 * - Backspace navigation
 * - Copy-paste support
 * - Accessible and keyboard-friendly
 */

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import Input from './Input';

export interface OTPInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: string | null;
  className?: string;
  autoFocus?: boolean;
}

export interface OTPInputRef {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
}

const OTPInput = forwardRef<OTPInputRef, OTPInputProps>(
  ({ length = 6, value: controlledValue, onChange, onComplete, disabled = false, error, className = '', autoFocus = true }, ref) => {
    const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const isControlled = controlledValue !== undefined;

    // Sync with controlled value if provided
    useEffect(() => {
      if (isControlled && controlledValue) {
        const otpArray = controlledValue.split('').slice(0, length);
        const newOtp = [...Array(length).fill('')];
        otpArray.forEach((char, index) => {
          if (index < length) {
            newOtp[index] = char;
          }
        });
        // Use setTimeout to avoid setState in effect warning
        setTimeout(() => {
          setOtp(newOtp);
        }, 0);
      }
    }, [controlledValue, isControlled, length]);

    // Focus first input on mount if autoFocus is enabled
    useEffect(() => {
      if (autoFocus && !disabled) {
        inputRefs.current[0]?.focus();
      }
    }, [autoFocus, disabled]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRefs.current[0]?.focus();
      },
      clear: () => {
        const emptyOtp = Array(length).fill('');
        setOtp(emptyOtp);
        if (onChange) {
          onChange('');
        }
        inputRefs.current[0]?.focus();
      },
      getValue: () => {
        return otp.join('');
      },
    }));

    const updateOtp = (newOtp: string[]) => {
      setOtp(newOtp);
      const otpString = newOtp.join('');
      if (onChange) {
        onChange(otpString);
      }
      if (onComplete && otpString.length === length) {
        onComplete(otpString);
      }
    };

    const handleOtpChange = (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return; // Only allow digits

      const newOtp = [...otp];
      newOtp[index] = value.slice(-1); // Only take last character
      updateOtp(newOtp);

      // Auto-focus next input
      if (value && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, length);
      
      if (pasteData.length > 0) {
        const newOtp = [...Array(length).fill('')];
        for (let i = 0; i < length && i < pasteData.length; i++) {
          newOtp[i] = pasteData[i];
        }
        updateOtp(newOtp);
        
        // Focus the next empty input or the last one
        const focusIndex = Math.min(pasteData.length, length - 1);
        inputRefs.current[focusIndex]?.focus();
      }
    };

    return (
      <div className={`flex justify-center gap-2 sm:gap-3 ${className}`}>
        {otp.map((digit, index) => (
          <Input
            key={`otp-input-${index}`}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold"
            disabled={disabled}
            aria-label={`OTP digit ${index + 1}`}
            aria-invalid={error ? 'true' : 'false'}
            required
          />
        ))}
      </div>
    );
  }
);

OTPInput.displayName = 'OTPInput';

export default OTPInput;
