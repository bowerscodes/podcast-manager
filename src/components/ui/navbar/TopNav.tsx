"use client";

import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/modal";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

import { useAuth } from "@/providers/Providers";
import { fetchUserProfile } from "@/lib/profileUtils";
import UserMenu from "./UserMenu";
import LoginModal from "./LoginModal";
import { appTitle } from "@/lib/data";

interface Profile {
  display_name: string | undefined;
}

export default function TopNav() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  // Use useCallback to memoize the function and prevent infinite re-renders
  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    try {
      const { profile: profileData, error } = await fetchUserProfile(user.id);
      
      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
      
      setProfile(profileData);
    } catch (error) {
      console.error("Unexpected error fetching profile:", error);
    }
  }, [user]);

  useEffect(() => {
    // Initial fetch
    loadProfile();

    // Listen for profile update events
    const handleProfileUpdate = () => {
      loadProfile();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, [loadProfile]); // Now we can safely include loadProfile

  const handleLogoClick = () => {
    router.push("/");
  };

  return (
    <>
      <nav className={"relative"}>
        <div className="absolute inset-0"></div>
        <div className="relative flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <h1
              className="text-2xl font-bold cursor-pointer transition-colors duration-150"
              style={{
                color: "white",
                textShadow: "1px 1px 6px rgba(0, 0, 0, 0.5)",
              }}
              onClick={handleLogoClick}
            >
              🎙️ {appTitle}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <UserMenu user={user} profile={profile} />
            ) : (
              <Button onPress={onOpen} className="btn-primary">
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>
      <LoginModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}
