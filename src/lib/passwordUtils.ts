"use server";

import { createServerClient } from "@/lib/createServiceClient";

export async function validatePassword(password: string, confirmPassword?: string): Promise<{
  valid: boolean;
  error: string | null;
}> {
  // Check minimum length
  if (password.length < 6) {
    return {
      valid: false,
      error: "Password must be at least 6 characters"
    };
  }

  // Check maximum length (reasonable limit)
  if (password.length > 128) {
    return {
      valid: false,
      error: "Password is too long (maximum 128 characters)"
    };
  }

  // Check for at least one letter and one number (optional but recommended)
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return {
      valid: false,
      error: "Password must contain at least one letter and one number"
    };
  }

  // Check password confirmation if provided
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return {
      valid: false,
      error: "Passwords don't match"
    };
  }

  return {
    valid: true,
    error: null
  };
}

export async function validatePasswordStrength(password: string): Promise<{
  strength: 'weak' | 'medium' | 'strong';
  score: number;
  suggestions: string[];
}> {
  let score = 0;
  const suggestions: string[] = [];

  // Length scoring
  if (password.length >= 8) score += 1;
  else suggestions.push("Use at least 8 characters");

  if (password.length >= 12) score += 1;
  else if (password.length >= 8) suggestions.push("Consider using 12+ characters for better security");

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  else suggestions.push("Include lowercase letters");

  if (/[A-Z]/.test(password)) score += 1;
  else suggestions.push("Include uppercase letters");

  if (/\d/.test(password)) score += 1;
  else suggestions.push("Include numbers");

  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else suggestions.push("Include special characters (!@#$%^&*)");

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong';
  if (score <= 2) strength = 'weak';
  else if (score <= 4) strength = 'medium';
  else strength = 'strong';

  return { strength, score, suggestions };
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const supabaseServer = createServerClient();

    const { error } = await supabaseServer.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) {
      console.error("Error updating password:", error);
      return {
        success: false,
        error: error.message || "Failed to update password"
      };
    }

    return {
      success: true,
      error: null
    };
  } catch (error) {
    console.error("Unexpected error updating password:", error);
    return {
      success: false,
      error: "An unexpected error occurred"
    };
  }
}
