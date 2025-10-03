import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  onSelect: (value: string) => void;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'header';
}

export function Dropdown({
  options,
  value,
  placeholder = 'Select...',
  onSelect,
  className,
  disabled = false,
  size = 'md',
  variant = 'default'
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);
  
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onSelect(optionValue);
    setIsOpen(false);
  };

  const buttonClasses = variant === 'header'
    ? 'w-full !bg-gray-700 !border-gray-600 !text-white rounded-md shadow-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:!bg-gray-600 transition-colors'
    : 'w-full bg-white border border-gray-300 rounded-md shadow-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-50 transition-colors';

  const textClasses = variant === 'header'
    ? clsx('block truncate !text-white', !selectedOption && '!text-gray-300')
    : clsx('block truncate', !selectedOption && 'text-gray-500');

  const iconClasses = variant === 'header'
    ? clsx('h-4 w-4 !text-gray-300 transition-transform', isOpen && 'transform rotate-180')
    : clsx('h-4 w-4 text-gray-400 transition-transform', isOpen && 'transform rotate-180');

  return (
    <div className={clsx('relative', className)} ref={dropdownRef}>
      <button
        type="button"
        className={clsx(
          buttonClasses,
          sizeClasses[size],
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'ring-2 ring-blue-500 border-blue-500'
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={textClasses}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={iconClasses} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg border border-gray-300 rounded-md py-1 max-h-60 overflow-auto">
          {options.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">No options available</div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={clsx(
                  'w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors',
                  option.value === value && 'bg-blue-50 text-blue-600 font-medium'
                )}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={option.value === value}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}