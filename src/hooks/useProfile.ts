"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/Providers";

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ 
    username?: string; 
    display_name?: string;
    avatar_url?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setProfile(null);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("username, display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        setError(new Error(error.message));
        return;
      }
      
      if (data && data.username) {
        setProfile(data);
        setShowUsernameSetup(false);
      } else {
        setProfile(data || null);
        setShowUsernameSetup(true);
      }
    } catch (err) {
      console.error("Error in loadProfile:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Force a refresh
  const refreshProfile = useCallback(() => {
    loadProfile();
  }, [loadProfile]);

  // Initial load
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    loading,
    error,
    showUsernameSetup,
    refreshProfile
  };
}
