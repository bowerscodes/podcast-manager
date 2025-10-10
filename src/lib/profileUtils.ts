"use server";

import { createServerClient } from "@/lib/createServiceClient";


// This ensures a profile exists when called
export async function ensureUserProfile(userId: string) {
  if (!userId) return { success: false, error: "No user ID provided" };

  // Use your service client pattern to access Supabase with admin privileges
  const supabase = createServerClient();
  
  try {
    // First check if profile exists
    const { data } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', userId)
      .maybeSingle();
    
    // If profile exists, we're done
    if (data) {
      return { success: true, hasUsername: !!data.username };
    }
    
    // Create the profile with a temporary username 
    // (we'll update it later when the user sets their real username)
    const tempUsername = `user_${Date.now().toString().slice(-6)}`;
    
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        // Add a temporary username to satisfy the not-null constraint
        username: tempUsername,
        display_name: "New User",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error("Error creating profile:", insertError);
      return { success: false, error: insertError.message };
    }
    
    // Return success but indicate username needs to be set
    return { success: true, hasUsername: false };
  } catch (err) {
    console.error("Exception in ensureUserProfile:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }
};

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

export async function deleteUserAccount(userId: string) {
  const supabase = createServerClient();
  
  try {
    // First, delete all episodes for all podcasts owned by the user
    // Get all podcast IDs for this user
    const { data: podcasts, error: podcastsError } = await supabase
      .from("podcasts")
      .select("id")
      .eq("user_id", userId);
    
    if (podcastsError) {
      console.error("Error fetching user podcasts:", podcastsError);
      return { success: false, error: "Failed to fetch user data" };
    }

    // If user has podcasts, delete all associated episodes
    if (podcasts && podcasts.length > 0) {
      const podcastIds = podcasts.map(p => p.id);
      
      const { error: episodesError } = await supabase
        .from("episodes")
        .delete()
        .in("podcast_id", podcastIds);
      
      if (episodesError) {
        console.error("Error deleting episodes:", episodesError);
        return { success: false, error: "Failed to delete episodes" };
      }
    }

    // Delete all podcasts owned by the user
    const { error: deletePodcastsError } = await supabase
      .from("podcasts")
      .delete()
      .eq("user_id", userId);
    
    if (deletePodcastsError) {
      console.error("Error deleting podcasts:", deletePodcastsError);
      return { success: false, error: "Failed to delete podcasts" };
    }

    // Delete the user's profile
    const { error: deleteProfileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);
    
    if (deleteProfileError) {
      console.error("Error deleting profile:", deleteProfileError);
      return { success: false, error: "Failed to delete profile" };
    }

    // Finally, delete the user from auth.users using the service role client
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
    
    if (deleteAuthError) {
      console.error("Error deleting auth user:", deleteAuthError);
      return { success: false, error: "Failed to delete authentication data" };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("Exception in deleteUserAccount:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Unknown error occurred" 
    };
  }
}
