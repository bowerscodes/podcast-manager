'use client';

import { HeroUIProvider } from '@heroui/react';
import { Toaster } from 'react-hot-toast';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import UsernameSetupModal from '@/components/auth/UsernameSetupModal';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Session validation interval: 10 minutes (600,000ms)
const SESSION_VALIDATION_INTERVAL = 10 * 60 * 1000;

export default function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ username: string | null } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true); // true for initial load
  const lastValidationRef = useRef<number>(Date.now());
  const hasLoadedProfileRef = useRef(false);

  // Auth state management
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setUserId(session?.user?.id ?? null);
      setLoading(false);
      lastValidationRef.current = Date.now();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const now = Date.now();
        const timeSinceLastValidation = now - lastValidationRef.current;

        // Always update on actual auth events (Sign in/out)
        if (_event === "SIGNED_IN" || _event === "SIGNED_OUT" || _event === "USER_UPDATED") {
          setUser(session?.user ?? null);
          setUserId(session?.user?.id ?? null);
          setLoading(false);
          lastValidationRef.current = now;
          
          // Reset profile loaded flag on sign out
          if (_event === "SIGNED_OUT") {
            hasLoadedProfileRef.current = false;
            setProfileLoading(true);
          }
          return;
        }


        // For TOKEN_REFRESHED events, only update if enough time has passed
        // - this prevents unecessary re-renders on tab-focus while maintaining security.
        if (timeSinceLastValidation < SESSION_VALIDATION_INTERVAL) {
          // Session was recently validated, skip re-update to prevent screen flash
          return;
        }

        setUser((prevUser) => {
          const newUser = session?.user ?? null;
          // Only update state if user actually changed
          if (prevUser?.id === newUser?.id) {
            lastValidationRef.current = now;
            return prevUser;
          }
          setUserId(session?.user?.id ?? null);
          lastValidationRef.current = now;
          return newUser;
        });
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile when user authenticates
  useEffect(() => {
    if (!userId) {
      setProfile(null);
      // Only show loading spinner if we haven't loaded a profile yet
      if (!hasLoadedProfileRef.current) {
        setProfileLoading(false);
      }
      return;
    }

    let cancelled = false;

    // Only show loading on first profile fetch
    if (!hasLoadedProfileRef.current) {
      setProfileLoading(true);
    }

    const fetchProfile = async () => {
      // Profile should exist from trigger, just fetch it
      const { data: profileData } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .single();

      if (!cancelled) {
        setProfile(profileData ?? null);
        hasLoadedProfileRef.current = true;
        setProfileLoading(false);
      }
    };

    fetchProfile();

    // Listen for profileUpdated event to re-fetch profile
    const handler = () => fetchProfile();
    window.addEventListener("profileUpdated", handler);

    return () => {
      cancelled = true;
      window.removeEventListener("profileUpdated", handler);
    };
  }, [userId]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Only render children once profile loading is complete
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signOut,
    }}>
      <HeroUIProvider>
        <Toaster position='top-right' />
        {profileLoading ? null : (
          <>
            {children}
            {/* Show modal if user exists but username is null/empty */}
            {user && profile && !profile.username && <UsernameSetupModal />}
          </>
        )}
      </HeroUIProvider>
    </AuthContext.Provider>
  );
}
