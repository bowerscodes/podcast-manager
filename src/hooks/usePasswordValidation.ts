import { useState, useEffect } from 'react';
import { validatePasswordStrength } from '@/lib/passwordUtils';

export function usePasswordValidation(password: string) {
  const [passwordStrength, setPasswordStrength] = useState<{
    strength: 'weak' | 'medium' | 'strong';
    score: number;
    suggestions: string[];
  } | null>(null);

  useEffect(() => {
    if (password) {
      validatePasswordStrength(password).then(setPasswordStrength);
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  return passwordStrength;
}
