"use client";

import { Input } from "@heroui/input";
import { ChangeEvent } from "react";

interface PasswordInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  error?: string;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
}

export default function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
  autoComplete = "new-password",
  error,
  color
}: PasswordInputProps) {
  return (
    <Input
      label={label}
      labelPlacement="outside"
      type="password"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      variant="bordered"
      color={color}
      isInvalid={!!error}
      errorMessage={error}
      classNames={{
        base: "max-w-xs",
        label: "!font-semibold !text-gray-600",
      }}
      autoComplete={autoComplete}
    />
  );
}
