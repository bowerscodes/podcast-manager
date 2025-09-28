"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import { validateEmail, checkEmailAvailable, verifyCurrentEmail } from "@/lib/emailUtils";
import { updateUserEmail } from "@/lib/clientEmailUtils";

export default function EmailForm({ user }: { user: User }) {
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [errors, setErrors] = useState<{current?: string; new?: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateEmail = async () => {
    setIsLoading(true);
    setErrors({});
    
    try {
      // Verify current email
      const { valid: currentValid, error: currentError } = await verifyCurrentEmail(user.id, currentEmail);
      if (!currentValid) {
        setErrors(prev => ({ ...prev, current: currentError || "Current email is incorrect" }));
        return;
      }

      // Validate new email
      const { valid: formatValid, error: formatError, cleanEmail } = await validateEmail(newEmail);
      if (!formatValid) {
        setErrors(prev => ({ ...prev, new: formatError || "Invalid email format" }));
        return;
      }
      
      // Check email availability
      const { available, error: availError } = await checkEmailAvailable(cleanEmail, user.id);
      if (!available) {
        setErrors(prev => ({ ...prev, new: availError || "Email already in use" }));
        return;
      }

      // Update email
      const { success, error } = await updateUserEmail(cleanEmail);
      if (!success) {
        toast.error(error || "Failed to update email");
        return;
      }

      toast.success("Confirmation email sent! Check your current email address to confirm the change.");
      setCurrentEmail("");
      setNewEmail("");
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
        label="Confirm Current Email Address"
        labelPlacement="outside"
        type="email"
        value={currentEmail}
        variant="bordered"
        onChange={(e) => setCurrentEmail(e.target.value)}
        isInvalid={!!errors.current}
        errorMessage={errors.current}
        classNames={{
          base: "max-w-xs",
          label: "!font-semibold !text-gray-600",
          description: "!font-semibold",
        }}
        description="Enter your current email address to verify"
        placeholder="Enter your new current address"
      />

      <Input
        label="New Email Address"
        labelPlacement="outside"
        type="email"
        value={newEmail}
        variant="bordered"
        onChange={(e) => setNewEmail(e.target.value)}
        isInvalid={!!errors.new}
        errorMessage={errors.new}
        classNames={{
          base: "max-w-xs",
          label: "!font-semibold !text-gray-600",
          description: "!font-semibold",
        }}
        description="You'll need to confirm the new email address"
        placeholder="Enter your new email address"
      />

      <Button
        color="primary"
        onPress={handleUpdateEmail}
        className="self-start"
        isLoading={isLoading}
        isDisabled={!currentEmail || !newEmail || isLoading}
      >
        Update Email
      </Button>
    </div>
  );
}
