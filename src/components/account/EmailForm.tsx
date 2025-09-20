"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";

import { validateEmail, checkEmailAvailable, updateUserEmail } from "@/lib/emailUtils";

type Props = {
  user: User;
};

export default function EmailForm({ user }: Props) {
  const [newEmail, setNewEmail] = useState(user.email || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateEmail = async () => {
    setIsLoading(true);

    try {
      // Validate email format
      const { valid, error: validationError, cleanEmail } = await validateEmail(newEmail);
      
      if (!valid) {
        toast.error(validationError);
        return;
      }

      // Check if email is the same as current
      if (cleanEmail === user.email?.toLowerCase()) {
        toast.error("This is already your current email address");
        return;
      }

      // Check if email is available
      const { available, error: checkError } = await checkEmailAvailable(cleanEmail, user.id);

      if (checkError) {
        toast.error(checkError);
        return;
      }

      if (!available) {
        toast.error("This email address is already in use");
        return;
      }

      // Update email
      const { success, error } = await updateUserEmail(user.id, cleanEmail);

      if (!success) {
        toast.error(error || "Failed to update email");
        return;
      }

      toast.success("Email update initiated. Check your inbox for confirmation.");
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent("emailUpdated"));
      
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
        label="New Email Address"
        labelPlacement="outside"
        type="email"
        value={newEmail}
        variant="bordered"
        onChange={(e) => setNewEmail(e.target.value)}
        classNames={{
          base: "max-w-xs",
          label: "!font-semibold !text-gray-600",
          description: "!font-semibold"
        }}
        description="You'll need to confirm the new email address"
      />
      <Button 
        color="primary" 
        onPress={handleUpdateEmail} 
        className="self-start"
        isLoading={isLoading}
        isDisabled={newEmail === user.email}
      >
        Update Email
      </Button>
    </div>
  );
}
