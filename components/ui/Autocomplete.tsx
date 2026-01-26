'use client';

/**
 * Autocomplete Input Component
 * 
 * Provides autocomplete functionality for address fields like city, state, country.
 * Displays suggestions as user types and allows selection from dropdown.
 */

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils/cn';
import FormField from './FormField';

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  id?: string;
  maxLength?: number;
  className?: string;
  onInputChange?: (value: string) => void;
  filterSuggestions?: (query: string, suggestions: string[]) => string[];
}

export default function Autocomplete({
  value,
  onChange,
  suggestions,
  label,
  placeholder,
  required = false,
  disabled = false,
  error,
  id,
  maxLength,
  className = '',
  onInputChange,
  filterSuggestions,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fieldId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  // Sync input value with prop value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filter suggestions based on input
  const getFilteredSuggestions = () => {
    if (!inputValue.trim()) return suggestions.slice(0, 10);
    
    if (filterSuggestions) {
      return filterSuggestions(inputValue, suggestions);
    }
    
    const normalizedQuery = inputValue.toLowerCase().trim();
    return suggestions
      .filter(suggestion => suggestion.toLowerCase().includes(normalizedQuery))
      .slice(0, 10);
  };

  const filteredSuggestions = getFilteredSuggestions();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
    
    if (onInputChange) {
      onInputChange(newValue);
    }
  };

  const handleInputFocus = () => {
    if (filteredSuggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleSelect = (suggestion: string) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredSuggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
          handleSelect(filteredSuggestions[highlightedIndex]);
        } else if (filteredSuggestions.length === 1) {
          handleSelect(filteredSuggestions[0]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const baseStyles = 'w-full px-4 py-2 border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--text-on-cream)] bg-[var(--cream)] text-[var(--text-on-cream)] min-h-[44px] text-base disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <FormField id={fieldId} label={label} error={error} required={required} className={className}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id={fieldId}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          className={cn(baseStyles, error && 'border-[var(--error-border)]')}
          aria-required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error && fieldId ? `${fieldId}-error` : undefined}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={fieldId ? `${fieldId}-listbox` : undefined}
          role="combobox"
        />
        
        {isOpen && filteredSuggestions.length > 0 && (
          <div
            ref={dropdownRef}
            id={fieldId ? `${fieldId}-listbox` : undefined}
            className="absolute z-50 w-full mt-1 bg-[var(--cream)] border border-[var(--border-light)] rounded-lg shadow-lg max-h-60 overflow-auto"
            role="listbox"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  'px-4 py-2 cursor-pointer text-[var(--text-on-cream)] hover:bg-[var(--black-opacity-4)]',
                  index === highlightedIndex && 'bg-[var(--black-opacity-4)]'
                )}
                role="option"
                aria-selected={index === highlightedIndex}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    </FormField>
  );
}
