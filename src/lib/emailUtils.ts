"use client";

import { createServerClient } from "@/lib/createServiceClient";

export async function validateEmail(email: string): Promise<{
  valid: boolean;
  error: string | null;
  cleanEmail: string;
}> {
  const cleanEmail = email.trim().toLowerCase();

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return {
      valid: false,
      error: "Please enter a valid email address",
      cleanEmail
    };
  }

  // Check minimum length
  if (cleanEmail.length < 5) {
    return {
      valid: false,
      error: "Email address is too short",
      cleanEmail
    };
  }

  // Check maximum length
  if (cleanEmail.length > 254) {
    return {
      valid: false,
      error: "Email address is too long",
      cleanEmail
    };
  }

  return {
    valid: true,
    error: null,
    cleanEmail
  };
}

export async function verifyCurrentEmail(userId: string, providedEmail: string): Promise<{
  valid: boolean;
  error: string | null;
}> {
  try {
    const supabaseServer = createServerClient();

    // Get the user's current email from the database
    const { data: user, error } = await supabaseServer.auth.admin.getUserById(userId);

    if (error) {
      console.error("Error fetching user for email verification: ", error);
      return {
        valid: false,
        error: "Unable to verify current email address"
      };
    }

    if (!user.user) {
      return {
        valid: false,
        error: "User not found"
      };
    }

    // Clean and compare emails (case-sensitive)
    const cleanProvidedEmail = providedEmail.trim().toLowerCase();
    const actualEmail = user.user.email?.toLocaleLowerCase();

    if (!actualEmail) {
      return {
        valid: false,
        error: "No email address found for this account"
      };
    }
    
    if (cleanProvidedEmail !== actualEmail) {
      return {
        valid: false,
        error: "Current email address is incorrect"
      };
    }

    return {
      valid: true,
      error: null
    };
  } catch (error) {
    console.error("Unexpected error verifying current email: ", error);
    return {
      valid: false,
      error: "Unable to verify current email address"
    };
  }
}

export async function checkEmailAvailable(email: string, currentUserId: string): Promise<{
  available: boolean;
  error: string | null;
}> {
  try {
    const supabaseServer = createServerClient();

    // Check if email is already in use by another user
    const { data: existingUser, error } = await supabaseServer.auth.admin.listUsers();

    if (error) {
      console.error("Error checking email availability:", error);
      return {
        available: false,
        error: "Unable to verify email availability"
      };
    }

    // Check if any other user has this email
    const emailTaken = existingUser.users.some(user => 
      user.email?.toLowerCase() === email.toLowerCase() && user.id !== currentUserId
    );

    if (emailTaken) {
      return {
        available: false,
        error: "This email address is already in use"
      };
    }

    return {
      available: true,
      error: null
    };
  } catch (error) {
    console.error("Unexpected error checking email availability:", error);
    return {
      available: false,
      error: "Unable to verify email availability"
    };
  }
}

export async function adminUpdateUserEmail(userId: string, newEmail: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const supabaseServer = createServerClient();

    const { error } = await supabaseServer.auth.admin.updateUserById(userId, {
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
