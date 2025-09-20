"use server";

import { createServerClient } from "@/lib/createServiceClient";

export async function fetchUserProfile(userId: string) {
  const supabaseServer = createServerClient();
  
  const { data, error } = await supabaseServer
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return { profile: null, error: error.message };
  }

  return { profile: data, error: null };
}

export async function checkUsernameAvailable(username: string, currentUserId: string) {
  const supabaseServer = createServerClient();

  const { data: existingUsers, error } = await supabaseServer
    .from("profiles")
    .select("id")
    .eq("username", username.toLowerCase())
    .neq("id", currentUserId);
  
  if (error) {
    console.error("Error checking username:", error);
    return { available: false, error: "Error checking username availability" };
  }

  return {
    available: existingUsers.length === 0,
    error: null
  };
}

export async function validateUsername(username: string) {
  const cleanUsername = username.trim().toLowerCase();
  
  if (cleanUsername.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters", cleanUsername };
  }
  
  // Add any other validation rules here
  if (!/^[a-z0-9-]+$/.test(cleanUsername)) {
    return { valid: false, error: "Username can only contain lowercase letters, numbers and hyphens", cleanUsername };
  }
  
  return { valid: true, error: null, cleanUsername };
}

export async function updateProfile(
  userId: string, 
  updates: { username?: string; display_name?: string | null }
) {
  const supabaseServer = createServerClient();
  
  const { error } = await supabaseServer
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }

  return { success: true, error: null };
}
