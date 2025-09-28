import { useState, useEffect, useRef } from 'react';

export interface ValidationState {
  isValid: boolean;
  errorMessage: string;
  isValidating: boolean;
}

export function useFieldValidation<T>(
  value: T,
  validator: (value: T) => Promise<{ valid: boolean; error: string | null }>,
  debounceMs = 500,
) {
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: true,
    errorMessage: "",
    isValidating: false
  });

  // Store validator in a ref to avoid dependency issues
  const validatorRef = useRef(validator);
  validatorRef.current = validator;

  useEffect(() => {
    // Don't validate empty values
    if (!value) {
      setValidationState({
        isValid: true,
        errorMessage: "",
        isValidating: false
      });
      return;
    }

    setValidationState(prev => ({ ...prev, isValidating: true }));

    const timeoutId = setTimeout(async () => {
      try {
        // Use the ref version of validator
        const { valid, error } = await validatorRef.current(value);

        setValidationState({
          isValid: valid,
          errorMessage: error || "",
          isValidating: false
        });
      } catch (err) {
        setValidationState({
          isValid: false,
          errorMessage: err instanceof Error ? err.message : "Validation error occurred",
          isValidating: false
        });
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [value, debounceMs]);

  return validationState;
}
