import { useState, useEffect } from 'react';
import { validatePasswordStrength } from '@/lib/SS/passwordUtils';

export function usePasswordStrength(password: string) {
  const [strength, setStrength] = useState<{
    strength: 'weak' | 'medium' | 'strong';
    score: number;
    suggestions: string[];
  } | null>(null);

  useEffect(() => {
    if (!password) {
      setStrength(null);
      return;
    }
    
    validatePasswordStrength(password).then(setStrength);
  }, [password]);

  return strength;
}
