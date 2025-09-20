"use client";

import { Input } from "@heroui/input";
import { ChangeEvent } from "react";
import { usePasswordValidation } from "@/hooks/usePasswordValidation";

interface PasswordInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  showStrength?: boolean;
  autoComplete?: string;
  // New props for password confirmation validation
  isConfirmField?: boolean;
  originalPassword?: string;
}

export default function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
  showStrength = true,
  autoComplete = "new-password",
  isConfirmField = false,
  originalPassword = ""
}: PasswordInputProps) {
  const passwordStrength = usePasswordValidation(value);

  // Determine validation state for confirm field
  const getValidationState = () => {
    if (!isConfirmField || !value) return undefined;
    
    return value === originalPassword ? "valid" : "invalid";
  };

  // Get border color based on validation state
  const getBorderColor = () => {
    if (!isConfirmField || !value) return undefined;
    
    return value === originalPassword ? "success" : "danger";
  };

  // Get helper text for confirm field
  const getHelperText = () => {
    if (!isConfirmField || !value) return undefined;
    
    return value === originalPassword ? "Passwords match" : "Passwords don't match";
  };

  // Get helper text color
  const getHelperColor = () => {
    if (!isConfirmField || !value) return undefined;
    
    return value === originalPassword ? "text-green-600" : "text-red-600";
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "weak": return "text-red-500";
      case "medium": return "text-yellow-500";
      case "strong": return "text-green-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div>
      <Input
        label={label}
        labelPlacement="outside"
        type="password"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        variant="bordered"
        color={getBorderColor()}
        validationState={getValidationState()}
        classNames={{
          base: "max-w-xs",
          label: "!font-semibold !text-gray-600",
          description: "!font-semibold",
        }}
        autoComplete={autoComplete}
      />
      
      {/* Show password strength for main password field */}
      {showStrength && passwordStrength && !isConfirmField && (
        <div className="mt-2 text-sm">
          <div className={`font-medium ${getStrengthColor(passwordStrength.strength)}`}>
            Password strength: {passwordStrength.strength}
          </div>
          {passwordStrength.suggestions.length > 0 && (
            <ul className="mt-1 text-gray-600 text-xs">
              {passwordStrength.suggestions.map((suggestion, index) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {/* Show confirmation message for confirm field */}
      {isConfirmField && value && (
        <div className={`mt-2 text-sm font-medium ${getHelperColor()}`}>
          {getHelperText()}
        </div>
      )}
    </div>
  );
}
