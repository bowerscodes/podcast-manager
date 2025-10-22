export type InputWidth = "xs" | "sm" | "md" | "lg" | "xl" | "full";
export type InputVariant = "flat" | "bordered" | "faded";

// Width classes for container
export const inputWidthStyles: Record<InputWidth, string> = {
  xs: "w-1/4",
  sm: "w-1/3",
  md: "w-1/2",
  lg: "w-2/3",
  xl: "w-3/4",
  full: "w-full",
};

// Variant styles for the actual input element
export const inputVariantStyles: Record<InputVariant, string> = {
  flat: "bg-gray-100 border-0 focus:bg-white focus:ring-2 focus:ring-purple-500",
  bordered: "bg-white border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200",
  faded: "bg-gray-50 border border-gray-200 focus:bg-white focus:border-purple-400 focus:ring-1 focus:ring-purple-200",
};

// Base styles shared by all inputs
export const inputBaseStyles = 
  "px-3 py-2 rounded-lg text-base transition-all duration-200 outline-none " +
  "disabled:opacity-50 disabled:cursor-not-allowed w-full";

// Error state styles
export const inputErrorStyles = "border-red-500 focus:border-red-500 focus:ring-red-200";

// Label and helper text styles
export const inputLabelStyles = "text-sm font-medium font-semibold text-gray-700";
export const inputDescriptionStyles = "text-xs font-semibold text-gray-400 mt-1";
export const inputErrorTextStyles = "text-sm font-semibold text-red-600 mb-1";
export const inputHelperTextStyles = "text-sm text-gray-500 mt-1";

// Shared props interface for all input-like components
export interface BaseInputProps {
  label?: string;
  description?: string;
  error?: string;
  helperText?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  variant?: InputVariant;
  width?: InputWidth;
  className?: string;
}

/**
 * Builds class names for input elements
 * Separates variant styling from error states for clearer composition
 */
export const buildInputClasses = (
  variant: InputVariant,
  hasError: boolean,
  className: string = ""
): string => {
  const classes = [
    inputBaseStyles,
    inputVariantStyles[variant],
    hasError ? inputErrorStyles : "",
    className,
  ];
  return classes.filter(Boolean).join(" ");
};

/**
 * Generates aria-describedby attribute value by concatenating all relevant IDs
 * Properly connects descriptions, helper text, and error messages for screen readers
 */
export const getAriaDescribedBy = (
  inputId: string,
  hasDescription: boolean,
  hasError: boolean,
  hasHelperText: boolean
): string | undefined => {
  const ids: string[] = [];
  
  if (hasDescription) ids.push(`${inputId}-description`);
  if (hasError) ids.push(`${inputId}-error`);
  else if (hasHelperText) ids.push(`${inputId}-helper`);
  
  return ids.length > 0 ? ids.join(" ") : undefined;
};