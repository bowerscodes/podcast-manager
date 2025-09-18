"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";

type Props = {
  user: User;
};

export default function DangerZone({ user }: Props) {
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmEmail !== user.email) {
      toast.error("Email confirmation doesn't match");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement account deletion logic
      toast.error("Account deletion not yet implemented");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-red-50">
      <div className="text-red-800">
        <h4 className="font-semibold">Delete Account</h4>
        <p className="text-sm mt-1">
          This will permanently delete your account and all associated podcasts and episodes. 
          This action cannot be undone.
        </p>
      </div>
      <Input
        label={`Type "${user.email}" to confirm`}
        value={confirmEmail}
        onChange={(e) => setConfirmEmail(e.target.value)}
      />
      <Button 
        color="danger" 
        onPress={handleDeleteAccount} 
        isLoading={isLoading}
        isDisabled={confirmEmail !== user.email}
      >
        Delete Account
      </Button>
    </div>
  );
}
