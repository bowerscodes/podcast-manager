/**
 * Form Validation Utilities
 * Provides reusable validation functions for form fields
 */

export type ValidationRule = {
  required?: boolean;
  type?: 'email' | 'url' | 'text';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | undefined;
};

export type FieldConfig = {
  label: string;
  rules: ValidationRule;
};

export type FormConfig = Record<string, FieldConfig>;

/**
 * Default error messages
 */
const defaultMessages = {
  required: (label: string) => `${label} is required`,
  email: (label: string) => `Please enter a valid ${label.toLowerCase()}`,
  url: (label: string) => `Please enter a valid ${label.toLowerCase()}`,
  minLength: (label: string, min: number) => 
    `${label} must be at least ${min} characters`,
  maxLength: (label: string, max: number) => 
    `${label} must be no more than ${max} characters`,
  pattern: (label: string) => `${label} format is invalid`,
};

/**
 * Validation patterns
 */
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
};

/**
 * Validates a single field value against its rules
 */
export function validateField(
  value: string | string[],
  rules: ValidationRule,
  label: string
): string | undefined {
  const stringValue = Array.isArray(value) ? value.join('') : value;
  const trimmedValue = stringValue.trim();

  // Required validation
  if (rules.required && !trimmedValue) {
    return defaultMessages.required(label);
  }

  // Skip other validations if field is empty and not required
  if (!trimmedValue && !rules.required) {
    return undefined;
  }

  // Type-based validation
  if (rules.type === 'email' && !patterns.email.test(trimmedValue)) {
    return defaultMessages.email(label);
  }

  if (rules.type === 'url' && !patterns.url.test(trimmedValue)) {
    return defaultMessages.url(label);
  }

  // Length validations
  if (rules.minLength && trimmedValue.length < rules.minLength) {
    return defaultMessages.minLength(label, rules.minLength);
  }

  if (rules.maxLength && trimmedValue.length > rules.maxLength) {
    return defaultMessages.maxLength(label, rules.maxLength);
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(trimmedValue)) {
    return defaultMessages.pattern(label);
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(trimmedValue);
  }

  return undefined;
}

/**
 * Validates an entire form based on field configuration
 */
export function validateForm<T extends Record<string, unknown>>(
  formData: T,
  config: FormConfig
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  Object.entries(config).forEach(([fieldName, fieldConfig]) => {
    const value = formData[fieldName];
    const error = validateField(
      value as string | string[], 
      fieldConfig.rules, 
      fieldConfig.label
    );
    
    if (error) {
      errors[fieldName] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Clears a specific field error from the errors object
 */
export function clearFieldError(
  errors: Record<string, string>,
  fieldName: string
): Record<string, string> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [fieldName]: removed, ...rest } = errors;
  return rest;
}
