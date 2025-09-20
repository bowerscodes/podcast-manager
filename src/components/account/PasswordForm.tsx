"use client";

import { Button } from "@heroui/button";
import React, { useState } from "react";
import { FormEvent, ChangeEvent } from "react";
import { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";

import { validatePassword, updateUserPassword } from "@/lib/passwordUtils";
import PasswordInput from "@/components/account/PasswordInput";
import { supabase } from "@/lib/supabase";

interface PasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

interface Props {
  user: User;
}

export default function PasswordForm({ user }: Props) {
  const [formData, setFormData] = useState<PasswordFormData>({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange =
    (field: keyof PasswordFormData) => (e: ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const updatePassword = async (): Promise<void> => {
    setIsLoading(true);

    try {
      // Validate password
      const { valid, error: validationError } = await validatePassword(
        formData.newPassword,
        formData.confirmPassword
      );

      if (!valid) {
        toast.error(validationError);
        return;
      }

      // Update password using server-side function
      const { success, error } = await updateUserPassword(
        user.id,
        formData.newPassword
      );

      if (!success) {
        toast.error(error || "Failed to update password");
        return;
      }

      // Refresh the session to ensure new password is active
      try {
        await supabase.auth.refreshSession();
        console.log("Session refreshed after password update");
      } catch (refreshError) {
        console.warn("Could not refresh session:", refreshError);
        // Don't fail the whole operation if refresh fails
      }

      toast.success("Password updated successfully");
      setFormData({ newPassword: "", confirmPassword: "" });

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent("passwordUpdated"));
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    await updatePassword();
  };

  const isFormValid = formData.newPassword && 
                     formData.confirmPassword && 
                     formData.newPassword === formData.confirmPassword;

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <input
        type="email"
        name="username"
        value={user?.email || ""}
        autoComplete="username"
        style={{ display: "none" }}
        readOnly
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className="flex flex-col gap-4 pt-6">
        <PasswordInput
          label="New Password"
          placeholder="Enter new password"
          value={formData.newPassword}
          onChange={handleInputChange("newPassword")}
          showStrength={true}
        />

        <PasswordInput
          label="Confirm New Password"
          placeholder="Confirm new password"
          value={formData.confirmPassword}
          onChange={handleInputChange("confirmPassword")}
          showStrength={false}
          isConfirmField={true}
          originalPassword={formData.newPassword}
        />

        <Button
          color="primary"
          onPress={updatePassword}
          isLoading={isLoading}
          isDisabled={!isFormValid}
          className="self-start"
        >
          Update Password
        </Button>
      </div>
    </form>
  );
}
