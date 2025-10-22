import { forwardRef, TextareaHTMLAttributes, useId } from "react";
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

interface TextareaProps extends BaseInputProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'width'> {
  minRows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  id,
  label,
  description,
  error,
  helperText,
  isRequired = false,
  isDisabled = false,
  isInvalid = false,
  variant = "bordered",
  width = "full",
  minRows = 3,
  className = "",
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

  const inputClasses = buildInputClasses(variant, hasError, `resize-none py-2 ${className}`);

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
      
      <textarea
        id={inputId}
        ref={ref}
        disabled={isDisabled}
        required={isRequired}
        aria-required={isRequired}
        aria-invalid={hasError}
        aria-describedby={ariaDescribedBy}
        rows={minRows}
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

Textarea.displayName = "Textarea";

export default Textarea;
