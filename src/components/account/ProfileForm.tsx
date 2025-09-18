"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

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
  const [username, setUsername] = useState(profile?.username || '');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Validate username
      if (username.length < 3) {
        toast.error("Username must be at least 3 characters");
        return;
      }

      // Check if username is taken (if changed)
      if (username !== profile?.username) {
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", username)
          .neq("id", user.id)
          .single();

        if (existingUser) {
          toast.error("Username is already taken");
          return;
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          username: username.toLowerCase(),
          display_name: displayName || null,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
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
        description="This appears in your podcast URLs"
        size="lg"
        startContent={
          <span className="text-gray-500">
            {process.env.NEXT_PUBLIC_BASE_URL}/
          </span>
        }
      />
      <Input
        label="Display Name"
        labelPlacement="outside"
        size="lg"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        description="Your public display name (optional)"
      />
      <Button 
        color="primary" 
        onPress={handleSave} 
        isLoading={isLoading}
      >
        Save Changes
      </Button>
    </div>
  );
}
