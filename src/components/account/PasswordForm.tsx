"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@heroui/button";
import toast from "react-hot-toast";

import { validatePassword, updateUserPassword, verifyCurrentPassword } from "@/lib/passwordUtils";
import PasswordInput from "@/components/account/PasswordInput";
import PasswordStrengthIndicator from "@/components/account/PasswordStrengthIndicator";

interface FormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Props {
  user: User;
}

export default function PasswordForm({ user }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    handleSubmit, 
    reset,
    watch,
    control,
    formState: { isValid },
    setError
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });
  
  // Watch the new password to use in confirmation validation
  const newPassword = watch("newPassword");

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    try {
      // 1. Verify current password
      const { valid: currentValid, error: currentError } = await verifyCurrentPassword(
        user.id,
        data.currentPassword
      );
      
      if (!currentValid) {
        setError("currentPassword", { 
          type: "manual", 
          message: currentError || "Current password is incorrect" 
        });
        setIsLoading(false);
        return;
      }
      
      // 2. Check if new password is same as current
      if (data.newPassword === data.currentPassword) {
        setError("newPassword", {
          type: "manual",
          message: "New password must be different from current password"
        });
        setIsLoading(false);
        return;
      }

      // 3. Update password
      const { success, error } = await updateUserPassword(
        user.id,
        data.newPassword
      );

      if (!success) {
        toast.error(error || "Failed to update password");
        setIsLoading(false);
        return;
      }

      toast.success("Password updated successfully");
      reset(); // Clear form fields
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent("passwordUpdated"));
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Hidden email field for password managers */}
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
        <div>
          <Controller 
            name="currentPassword"
            control={control}
            rules={{ required: "Current password is required" }}
            render={({ field, fieldState }) => (
              <PasswordInput
                label="Current Password"
                placeholder="Enter your current password"
                value={field.value}
                onChange={field.onChange}
                autoComplete="current-password"
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        <div>
          <Controller
            name="newPassword"
            control={control}
            rules={{
              required: "New password is required",
              validate: async (value) => {
                const result = await validatePassword(value);
                return result.valid || result.error || "Invalid password";
              }
            }}
            render={({ field, fieldState }) => (
              <PasswordInput
                label="New Password"
                placeholder="Enter new password"
                value={field.value}
                onChange={field.onChange}
                autoComplete="new-password"
                error={fieldState.error?.message}
              />
            )}
          />
          <PasswordStrengthIndicator password={newPassword} />
        </div>

        <div>
          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: "Please confirm your password",
              validate: (value) => value === newPassword || "Passwords don't match"
            }}
            render={({ field, fieldState }) => (
              <PasswordInput
                label="Confirm New Password"
                placeholder="Confirm new password"
                value={field.value}
                onChange={field.onChange}
                autoComplete="new-password"
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        <Button
          color="primary"
          type="submit"
          isLoading={isLoading}
          isDisabled={!isValid || isLoading}
          className="self-start"
        >
          Update Password
        </Button>
      </div>
    </form>
  );
}
