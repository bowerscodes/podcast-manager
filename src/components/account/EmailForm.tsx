"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";

import { validateEmail, checkEmailAvailable } from "@/lib/emailUtils";
import { updateUserEmail } from "@/lib/clientEmailUtils";

type Props = {
  user: User;
};

export default function EmailForm({ user }: Props) {
  // Initialize with empty string instead of user.email to avoid confusion
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateEmail = async () => {
    setIsLoading(true);

    // Add debugging logs
    console.log("Current user email:", user.email);
    console.log("New email from state:", newEmail);

    try {
      // Validate email format
      const { valid, error: validationError, cleanEmail } = await validateEmail(newEmail);
      
      console.log("Clean email after validation:", cleanEmail);
      
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

      console.log("About to update email to:", cleanEmail);

      // Update email (now using client-side function)
      const { success, error } = await updateUserEmail(cleanEmail);

      if (!success) {
        toast.error(error || "Failed to update email");
        return;
      }

      toast.success("Confirmation email sent! Check your new email address to confirm the change.");
      setNewEmail(''); // Clear the input after successful submission
            
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="text-sm text-gray-600 mb-2">
        Current email: <span className="font-medium">{user.email}</span>
      </div>
      
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
        placeholder="Enter your new email address"
      />
      <Button 
        color="primary" 
        onPress={handleUpdateEmail} 
        className="self-start"
        isLoading={isLoading}
        isDisabled={!newEmail || newEmail === user.email}
      >
        Update Email
      </Button>
    </div>
  );
}
