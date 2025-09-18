"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

type Props = {
  user: User;
};

export default function EmailForm({ user }: Props) {
  const [newEmail, setNewEmail] = useState(user.email || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateEmail = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

      toast.success("Email update initiated. Check your inbox for confirmation.");
    } catch (error) {
      console.error("Error updating email:", error);
      toast.error("Failed to update email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Current email: <span className="font-medium">{user.email}</span>
      </div>
      <Input
        label="New Email Address"
        type="email"
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
        description="You'll need to confirm the new email address"
      />
      <Button 
        color="primary" 
        onPress={handleUpdateEmail} 
        isLoading={isLoading}
        isDisabled={newEmail === user.email}
      >
        Update Email
      </Button>
    </div>
  );
}
