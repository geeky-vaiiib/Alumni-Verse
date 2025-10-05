/**
 * OTP Input Component
 * 6-digit OTP input with individual boxes and keyboard navigation
 */

import React, { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  className?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  className
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const handleChange = (index: number, newValue: string) => {
    // Only allow digits
    const digit = newValue.replace(/\D/g, '').slice(-1);
    
    const newOTP = value.split('');
    newOTP[index] = digit;
    const updatedValue = newOTP.join('');
    
    onChange(updatedValue);

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    // Call onComplete when all digits are entered
    if (updatedValue.length === length && onComplete) {
      onComplete(updatedValue);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      const newOTP = value.split('');
      
      if (newOTP[index]) {
        // Clear current digit
        newOTP[index] = '';
        onChange(newOTP.join(''));
      } else if (index > 0) {
        // Move to previous input and clear it
        newOTP[index - 1] = '';
        onChange(newOTP.join(''));
        inputsRef.current[index - 1]?.focus();
      }
    }

    // Handle left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    }

    // Handle right arrow
    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }

    // Handle home
    if (e.key === 'Home') {
      e.preventDefault();
      inputsRef.current[0]?.focus();
    }

    // Handle end
    if (e.key === 'End') {
      e.preventDefault();
      inputsRef.current[length - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const digits = pastedData.replace(/\D/g, '').slice(0, length);
    
    if (digits.length > 0) {
      onChange(digits);
      
      // Focus the next empty input or the last one
      const nextIndex = Math.min(digits.length, length - 1);
      inputsRef.current[nextIndex]?.focus();

      // Call onComplete if all digits are filled
      if (digits.length === length && onComplete) {
        onComplete(digits);
      }
    }
  };

  return (
    <div className={cn('flex gap-2 justify-center', className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(null)}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          className={cn(
            'w-12 h-14 text-center text-2xl font-bold',
            'rounded-lg border-2 transition-all duration-200',
            'bg-background text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
            disabled && 'opacity-50 cursor-not-allowed',
            focusedIndex === index && 'border-primary scale-105',
            value[index] ? 'border-primary/50' : 'border-border',
            'hover:border-primary/50'
          )}
        />
      ))}
    </div>
  );
};

export default OTPInput;
