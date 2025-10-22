import React, { forwardRef, InputHTMLAttributes, useId } from "react";

import {
  BaseInputProps,
  buildInputClasses,
  getAriaDescribedBy,
  inputWidthStyles,
  inputLabelStyles,
  inputDescriptionStyles,
  inputErrorTextStyles,
  inputHelperTextStyles,
} from "@/lib/input-config";
import { Error } from "./Error";

interface InputProps extends BaseInputProps, Omit<InputHTMLAttributes<HTMLInputElement>, "width"> {
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  spellCheck?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  id,
  label,
  description,
  className = "",
  error,
  helperText,
  isDisabled = false,
  isRequired = false,
  isInvalid = false,
  startContent,
  endContent,
  spellCheck = true,
  variant = "bordered",
  width = "full",
  ...props
}, ref) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const hasError = isInvalid || !!error;

  const ariaDescribedBy = getAriaDescribedBy(
    inputId,
    !!description,
    hasError,
    !!helperText
  );

  // When we have start/end content, we need a wrapper with styling
  // Otherwise, apply styles directly to the input
  const hasDecorators = startContent || endContent;

  if (hasDecorators) {
    // Build base wrapper styles without focus states (those go on the wrapper via focus-within)
    const baseWrapperStyles = `
      px-3 py-2 rounded-lg transition-all duration-200
      flex items-center gap-2 w-full
    `;
    
    const variantStyles = variant === "flat" 
      ? "bg-gray-100 border-0 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-500"
      : variant === "bordered"
      ? "bg-white border-2 border-gray-300 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200"
      : "bg-gray-50 border border-gray-200 focus-within:bg-white focus-within:border-purple-400 focus-within:ring-1 focus-within:ring-purple-200";
    
    const errorStyles = hasError 
      ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-200"
      : "";
    
    const wrapperClasses = `${baseWrapperStyles} ${variantStyles} ${errorStyles}`.trim();
    
    return (
      <div className={`flex flex-col gap-1 ${inputWidthStyles[width]}`}>
        {label && (
          <label htmlFor={inputId} className={inputLabelStyles}>
            {label}
            {isRequired && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        
        {error && (
          <Error 
            error={error}
            inputId={inputId}
          />
        )}
        
        <div className={wrapperClasses}>
          {startContent && (
            <div className="flex-shrink-0 text-gray-400" aria-hidden="true">
              {startContent}
            </div>
          )}
          
          <input
            id={inputId}
            ref={ref}
            disabled={isDisabled}
            required={isRequired}
            aria-required={isRequired}
            aria-invalid={hasError}
            aria-describedby={ariaDescribedBy}
            spellCheck={spellCheck}
            className={`
              bg-transparent border-0 outline-none p-0 flex-1 min-w-0
              disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
          
          {endContent && (
            <div className="flex-shrink-0 text-gray-400" aria-hidden="true">
              {endContent}
            </div>
          )}
        </div>
        
        {description && (
          <span id={`${inputId}-description`} className={inputDescriptionStyles}>
            {description}
          </span>
        )}
        
        {!error && helperText && (
          <span id={`${inputId}-helper`} className={inputHelperTextStyles}>
            {helperText}
          </span>
        )}
      </div>
    );
  }

  // Simple input without decorators - cleaner structure
  const inputClasses = buildInputClasses(variant, hasError, className);

  return (
    <div className={`flex flex-col gap-1 ${inputWidthStyles[width]}`}>
      {label && (
        <label htmlFor={inputId} className={inputLabelStyles}>
          {label}
          {isRequired && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      
      {error && (
        <span id={`${inputId}-error`} className={inputErrorTextStyles} role="alert">
          {error}
        </span>
      )}
      
      <input
        id={inputId}
        ref={ref}
        disabled={isDisabled}
        required={isRequired}
        aria-required={isRequired}
        aria-invalid={hasError}
        aria-describedby={ariaDescribedBy}
        spellCheck={spellCheck}
        className={inputClasses}
        {...props}
      />
      
      {description && (
        <span id={`${inputId}-description`} className={inputDescriptionStyles}>
          {description}
        </span>
      )}
      
      {!error && helperText && (
        <span id={`${inputId}-helper`} className={inputHelperTextStyles}>
          {helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
