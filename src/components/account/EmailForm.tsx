"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";

import { validateEmail, checkEmailAvailable, verifyCurrentEmail } from "@/lib/emailUtils";
import { updateUserEmail } from "@/lib/clientEmailUtils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";


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
        label="Current Email Address"
        type="email"
        value={currentEmail}
        variant="bordered"
        width="md"
        onChange={(e) => {
          setCurrentEmail(e.target.value);
          if (errors.current) setErrors(prev => ({ ...prev, current: undefined }));
        }}
        isInvalid={!!errors.current}
        error={errors.current}
        isRequired
        description="Enter your current email address to verify"
        placeholder="Enter your current email address"
      />

      <Input
        label="New Email Address"
        type="email"
        value={newEmail}
        variant="bordered"
        width="md"
        onChange={(e) => {
          setNewEmail(e.target.value);
          if (errors.new) setErrors(prev => ({ ...prev, new: undefined }));
        }}
        isInvalid={!!errors.new}
        error={errors.new}
        isRequired
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
