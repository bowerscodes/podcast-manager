"use client";

import { Control, Controller, FieldValues, Path } from "react-hook-form";
import PasswordInput from "./PasswordInput";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { validatePassword } from "@/lib/SS/passwordUtils";

interface Props<T extends FieldValues = FieldValues> {
  control: Control<T>;
  newPassword: string;
  showLabels?: boolean;
  inputClassName?: string;
}

export default function NewPasswordFields<T extends FieldValues = FieldValues>({ 
  control, 
  newPassword, 
  showLabels = true, 
  inputClassName
}: Props<T>) {
  return (
    <>
      <div>
        <Controller
          name={"newPassword" as Path<T>}
          control={control}
          rules={{
            required: "New password is required",
            validate: async (value) => {
              const result = await validatePassword(value as string);
              return result.valid || result.error || "Invalid password";
            }
          }}
          render={({ field, fieldState }) => (
            <PasswordInput
              label={showLabels ? "New Password" : "Password"}
              placeholder={showLabels ? "Enter new password" : "Enter your password"}
              value={field.value as string}
              onChange={field.onChange}
              autoComplete="new-password"
              error={fieldState.error?.message}
              inputClassName={inputClassName}
            />
          )}
        />
        <PasswordStrengthIndicator password={newPassword} />
      </div>

      <div>
        <Controller
          name={"confirmPassword" as Path<T>}
          control={control}
          rules={{
            required: "Please confirm your password",
            validate: (value) => value === newPassword || "Passwords don't match"
          }}
          render={({ field, fieldState }) => (
            <PasswordInput
              label={showLabels ? "Confirm New Password" : "Confirm Password"}
              placeholder={showLabels ? "Confirm new password" : "Confirm your password"}
              value={field.value as string}
              onChange={field.onChange}
              autoComplete="new-password"
              error={fieldState.error?.message}
              inputClassName={inputClassName}
            />
          )}
        />
      </div>
    </>
  );
}
