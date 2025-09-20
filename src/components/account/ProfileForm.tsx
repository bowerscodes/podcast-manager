"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";

import { checkUsernameAvailable, updateProfile, validateUsername } from "@/lib/profileUtils";

type Profile = {
  id: string;
  username: string;
  display_name?: string;
  created_at: string;
  updated_at: string;
};

type Props = {
  user: User;
  profile: Profile | null;
};

export default function ProfileForm({ user, profile }: Props) {
  const [username, setUsername] = useState(profile?.username || "");
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Await the validation function
      const { valid, error: validationError, cleanUsername } = await validateUsername(username);
      
      if (!valid) {
        toast.error(validationError);
        return;
      }

      const currentUsername = profile?.username?.toLowerCase() || "";

      // Check if username is taken (if changed)
      if (cleanUsername !== currentUsername) {
        const { available, error: checkError } = await checkUsernameAvailable(cleanUsername, user.id);

        if (checkError) {
          toast.error(checkError);
          return;
        }

        if (!available) {
          toast.error("Username is already taken");
          return;
        }
      }

      // Update profile
      const { success, error } = await updateProfile(user.id, {
        username: cleanUsername,
        display_name: displayName.trim() || null,
      });

      if (!success) {
        toast.error(error || "Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 pt-6">
      <Input
        label="Username"
        labelPlacement="outside"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        variant="bordered"
        classNames={{
          base: "max-w-sm",
          label: "!font-semibold !text-gray-600",
          description: "!font-semibold",
        }}
        startContent={
          <span className="text-gray-500">
            {process.env.NEXT_PUBLIC_BASE_URL}/
          </span>
        }
        description="This appears in your podcast URLs"
      />
      <Input
        label="Display Name"
        labelPlacement="outside"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        variant="bordered"
        classNames={{
          base: "max-w-2xs",
          label: "!font-semibold !text-gray-600",
          description: "!font-semibold",
        }}
        description="Your public display name (optional)"
      />
      <Button
        color="primary"
        onPress={handleSave}
        isLoading={isLoading}
        className="self-start"
      >
        Save Changes
      </Button>
    </div>
  );
}
