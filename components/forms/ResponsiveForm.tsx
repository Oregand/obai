'use client';

import React from 'react';
import useResponsive from '@/lib/hooks/useResponsive';

type FormField = {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'email' | 'password' | 'select' | 'checkbox' | 'radio' | 'number';
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  disabled?: boolean;
  helpText?: string;
  fullWidth?: boolean;
};

type FormLayout = 'stacked' | 'inline' | 'grid';

type ResponsiveFormProps = {
  fields: FormField[];
  onSubmit: (e: React.FormEvent) => void;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  layout?: FormLayout;
  loading?: boolean;
  error?: string;
  success?: string;
  className?: string;
  gridCols?: number;
};

export default function ResponsiveForm({
  fields,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
  layout = 'stacked',
  loading = false,
  error,
  success,
  className = '',
  gridCols = 2,
}: ResponsiveFormProps) {
  const { isMobile, isTablet } = useResponsive();

  // Determine layout based on responsive settings
  const effectiveLayout = isMobile ? 'stacked' : layout;
  
  // Generate grid columns CSS
  const gridColumnsClass = effectiveLayout === 'grid' 
    ? `grid-cols-1 md:grid-cols-${Math.min(gridCols, 3)}`
    : '';

  return (
    <form 
      onSubmit={onSubmit} 
      className={`w-full ${className}`}
      noValidate
    >
      {/* Form Layout Container */}
      <div 
        className={`
          ${effectiveLayout === 'stacked' ? 'space-y-6' : ''}
          ${effectiveLayout === 'inline' ? 'md:flex md:flex-wrap md:-mx-2' : ''}
          ${effectiveLayout === 'grid' ? `grid gap-6 ${gridColumnsClass}` : ''}
        `}
      >
        {/* Form Fields */}
        {fields.map((field) => (
          <div 
            key={field.id}
            className={`
              ${effectiveLayout === 'inline' ? 'md:px-2 md:flex-1 mb-6 md:mb-0' : ''}
              ${effectiveLayout === 'grid' && field.fullWidth ? 'md:col-span-full' : ''}
            `}
          >
            <FormField field={field} />
          </div>
        ))}
      </div>

      {/* Form Messages */}
      {(error || success) && (
        <div className="mt-6">
          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 rounded-md p-3 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-200 rounded-md p-3 text-sm">
              {success}
            </div>
          )}
        </div>
      )}

      {/* Form Actions */}
      <div className="mt-6 flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {cancelText}
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            submitText
          )}
        </button>
      </div>
    </form>
  );
}

// Individual Form Field Component
function FormField({ field }: { field: FormField }) {
  const { 
    id, 
    label, 
    type, 
    value, 
    onChange, 
    placeholder, 
    required, 
    error, 
    options,
    min, 
    max, 
    disabled,
    helpText 
  } = field;

  // Generate a unique ID for the field
  const fieldId = `field-${id}`;
  const errorId = `${fieldId}-error`;
  const helpTextId = helpText ? `${fieldId}-help` : undefined;

  // Base classes for all inputs
  const baseInputClasses = `
    w-full bg-midnight-light border border-midnight-light text-white rounded-md shadow-sm 
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  // Common props for accessibility
  const commonProps = {
    id: fieldId,
    disabled,
    'aria-describedby': [
      helpTextId,
      error ? errorId : null
    ].filter(Boolean).join(' ') || undefined,
    'aria-invalid': error ? 'true' : undefined,
    'aria-required': required ? 'true' : undefined,
  };

  return (
    <div>
      {/* Field Label */}
      <label 
        htmlFor={fieldId} 
        className={`block text-sm font-medium text-gray-300 mb-1 ${required ? 'required' : ''}`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Field Input */}
      <div className="mt-1">
        {type === 'text' || type === 'email' || type === 'password' || type === 'number' ? (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${baseInputClasses} py-2 px-3`}
            min={min}
            max={max}
            {...commonProps}
          />
        ) : type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className={`${baseInputClasses} py-2 px-3`}
            {...commonProps}
          />
        ) : type === 'select' ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseInputClasses} py-2 pl-3 pr-10`}
            {...commonProps}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === 'checkbox' ? (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 bg-midnight-light border-midnight-light rounded"
              {...commonProps}
            />
            <span className="ml-3 text-sm text-gray-300">
              {placeholder}
            </span>
          </div>
        ) : type === 'radio' && options ? (
          <div className="space-y-2">
            {options.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`${fieldId}-${option.value}`}
                  name={fieldId}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 bg-midnight-light border-midnight-light"
                  disabled={disabled}
                />
                <label htmlFor={`${fieldId}-${option.value}`} className="ml-3 text-sm text-gray-300">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Help Text */}
      {helpText && (
        <p id={helpTextId} className="mt-1 text-xs text-gray-400">
          {helpText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
