"use client";

import { supabase } from "./supabase";

export async function updateUserEmail(newEmail: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    
    const { error } = await supabase.auth.updateUser({
      email: newEmail
    });

    if (error) {
      console.error("Error updating email:", error);
      return {
        success: false,
        error: error.message || "Failed to update email"
      };
    }

    return {
      success: true,
      error: null
    };
  } catch (error) {
    console.error("Unexpected error updating email:", error);
    return {
      success: false,
      error: "An unexpected error occurred"
    };
  }
}
