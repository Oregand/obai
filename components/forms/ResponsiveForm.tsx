'use client';

import React from 'react';
import { useState, useEffect, useCallback, ChangeEvent } from 'react';

/**
 * A responsive form component that adapts to different screen sizes
 * and provides consistent styling for form elements.
 */

type FormLayout = 'horizontal' | 'vertical' | 'compact';

interface FieldError {
  message: string;
}

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
  placeholder?: string;
  required?: boolean;
  value: any; // Could be a string, number, boolean, etc.
  options?: { value: string; label: string }[];
  error?: FieldError;
  disabled?: boolean;
  helperText?: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  accept?: string; // For file inputs
  children?: React.ReactNode; // For custom field content
}

interface ResponsiveFormProps {
  title?: string;
  description?: string;
  fields: FormField[];
  onSubmit: (e: React.FormEvent) => void;
  submitText?: string;
  isSubmitting?: boolean;
  layout?: FormLayout;
  className?: string;
  formClassName?: string;
  resetButton?: boolean;
  resetText?: string;
  onReset?: () => void;
  children?: React.ReactNode;
}

const ResponsiveForm: React.FC<ResponsiveFormProps> = ({
  title,
  description,
  fields,
  onSubmit,
  submitText = 'Submit',
  isSubmitting = false,
  layout = 'vertical',
  className = '',
  formClassName = '',
  resetButton = false,
  resetText = 'Reset',
  onReset,
  children
}) => {
  // Default value for rows in textareas
  const DEFAULT_ROWS = 4;
  
  // Handle responsive layout
  const [currentLayout, setCurrentLayout] = useState<FormLayout>(layout);
  
  // Determine if we should use a compact layout for mobile
  const updateLayout = useCallback(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640 && layout !== 'compact') {
        setCurrentLayout('compact');
      } else {
        setCurrentLayout(layout);
      }
    }
  }, [layout]);
  
  // Update layout on resize
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateLayout);
      updateLayout();
      
      return () => {
        window.removeEventListener('resize', updateLayout);
      };
    }
  }, [updateLayout]);
  
  // Handle form reset
  const handleReset = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (onReset) {
      onReset();
    }
  }, [onReset]);
  
  // Calculate form layout classes
  const getFormLayoutClasses = (): string => {
    switch (currentLayout) {
      case 'horizontal':
        return 'sm:grid sm:grid-cols-[200px,1fr] sm:gap-4 sm:items-start';
      case 'compact':
        return 'space-y-2';
      case 'vertical':
      default:
        return 'space-y-4';
    }
  };
  
  // Calculate field layout classes
  const getFieldLayoutClasses = (type: string): string => {
    if (type === 'checkbox') {
      return 'flex items-center space-x-2';
    }
    
    switch (currentLayout) {
      case 'horizontal':
        return 'grid grid-cols-[200px,1fr] gap-4 items-start';
      case 'compact':
        return 'space-y-1';
      case 'vertical':
      default:
        return 'space-y-2';
    }
  };
  
  // Calculate label classes
  const getLabelClasses = (type: string, required: boolean = false): string => {
    let classes = 'font-medium';
    
    // Add specific styling based on field type
    if (type === 'checkbox' || type === 'radio') {
      classes += ' text-sm';
    } else {
      classes += ' text-gray-700';
    }
    
    // Add required indicator styling
    if (required) {
      classes += ' flex items-center gap-1 after:content-["*"] after:text-red-500';
    }
    
    return classes;
  };
  
  return (
    <div className={`responsive-form ${className}`}>
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      {description && <p className="text-gray-600 mb-6">{description}</p>}
      
      <form 
        onSubmit={onSubmit} 
        className={`space-y-6 ${formClassName}`} 
        noValidate
      >
        <div className={getFormLayoutClasses()}>
          {fields.map((field) => {
            const { 
              id, 
              label, 
              type, 
              placeholder, 
              required, 
              value, 
              options,
              error,
              disabled,
              helperText,
              onChange,
              min,
              max,
              step,
              rows,
              accept,
              children: fieldChildren
            } = field;
            
            // Generate unique IDs for the field elements
            const fieldId = `field-${id}`;
            const errorId = `error-${id}`;
            const helperId = `helper-${id}`;
            
            // Determine if we have a description for aria-describedby
            const hasDescription = helperText || error;
            const describedBy = hasDescription 
              ? (helperText ? helperId : '') + (error ? ' ' + errorId : '')
              : undefined;
            
            return (
              <div 
                key={id} 
                className={getFieldLayoutClasses(type)}
              >
                <label 
                  htmlFor={fieldId}
                  className={getLabelClasses(type, required)}
                >
                  {label}
                </label>
                
                <div className="flex-1 flex flex-col space-y-1">
                  {/* Render the appropriate input type */}
                  {type === 'textarea' ? (
                    <textarea
                      id={fieldId}
                      disabled={disabled}
                      aria-describedby={describedBy}
                      aria-invalid={error ? true : false}
                      aria-required={required ? true : false}
                      value={value}
                      onChange={onChange}
                      placeholder={placeholder}
                      rows={rows || DEFAULT_ROWS}
                      className={`w-full p-2 rounded border ${
                        error 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                  ) : type === 'select' ? (
                    <select
                      id={fieldId}
                      disabled={disabled}
                      aria-describedby={describedBy}
                      aria-invalid={error ? true : false}
                      aria-required={required ? true : false}
                      value={value}
                      onChange={onChange}
                      className={`w-full p-2 rounded border ${
                        error 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    >
                      {placeholder && <option value="">{placeholder}</option>}
                      {options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : type === 'checkbox' ? (
                    <div className="flex items-center">
                      <input
                        id={fieldId}
                        disabled={disabled}
                        aria-describedby={describedBy}
                        aria-invalid={error ? true : false}
                        aria-required={required ? true : false}
                        type="checkbox"
                        checked={value}
                        onChange={onChange}
                        className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                          error ? 'border-red-500' : ''
                        }`}
                      />
                    </div>
                  ) : (
                    <input
                      id={fieldId}
                      disabled={disabled}
                      aria-describedby={describedBy}
                      aria-invalid={error ? true : false}
                      aria-required={required ? true : false}
                      type={type}
                      value={value}
                      onChange={onChange}
                      placeholder={placeholder}
                      min={min}
                      max={max}
                      step={step}
                      accept={accept}
                      className={`w-full p-2 rounded border ${
                        error 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                  )}
                  
                  {/* Field children (for custom elements) */}
                  {fieldChildren}
                  
                  {/* Error message */}
                  {error && (
                    <p id={errorId} className="text-red-500 text-sm mt-1">
                      {error.message}
                    </p>
                  )}
                  
                  {/* Helper text */}
                  {helperText && !error && (
                    <p id={helperId} className="text-gray-500 text-sm mt-1">
                      {helperText}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Custom form content */}
        {children}
        
        {/* Form actions */}
        <div className="flex justify-end space-x-2 pt-4">
          {resetButton && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {resetText}
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-blue-400"
          >
            {isSubmitting ? 'Submitting...' : submitText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResponsiveForm;
