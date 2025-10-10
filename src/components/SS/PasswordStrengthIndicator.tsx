"use client";

import { usePasswordStrength } from "@/hooks/SS/usePasswordStrength";

interface Props {
  password: string;
}

export default function PasswordStrengthIndicator({ password }: Props) {
  const strength = usePasswordStrength(password);
  
  if (!password || !strength) return null;
  
  const getStrengthColor = () => {
    switch (strength.strength) {
      case "weak": return "text-red-500";
      case "medium": return "text-yellow-500";
      case "strong": return "text-green-500";
      default: return "text-gray-500";
    }
  };
  
  return (
    <div className="mt-2 text-sm">
      <div className={`font-medium ${getStrengthColor()}`}>
        Password strength: {strength.strength}
      </div>
      {strength.suggestions.length > 0 && (
        <ul className="mt-1 text-gray-600 text-xs">
          {strength.suggestions.map((suggestion, index) => (
            <li key={index}>• {suggestion}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
