"use client";

import { useState } from "react";
import { Spinner } from "@heroui/spinner";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

import { supabase } from "@/lib/supabase";
import { BiSolidLock } from "react-icons/bi";
import { validateEmail } from "@/lib/emailUtils";

type Props = {
  onSuccess?: () => void;
};

export default function MagicLinkForm({ onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email format first
    const validation = await validateEmail(email);
    if (!validation.valid) {
      setMessage({
        text: validation.error || "Invalid email address",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: validation.cleanEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        // Handle specific Supabase errors with descriptive messages
        if (error.message.includes("rate limit")) {
          throw new Error(
            "Too many attempts. Please try again after 1 minute."
          );
        } else if (error.message.includes("is invalid")) {
          throw new Error("Please enter a valid email address.");
        } else {
          throw error;
        }
      }

      setMessage({
        text: "Magic link sent. Check your email!",
        type: "success",
      });
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send magic link. Please try again";

      setMessage({
        text: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`p-3 rounded-lg font-semibold text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border-green-700 border-1"
              : "bg-red-100 text-red-700 border-red-700 border-1 "
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="screen-reader-only">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            aria-label="Email address"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="bordered"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={!email || loading}
          className="w-full py-2 px-2 shadow-md font-medium text-white btn-primary bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {!email ? (
            <span className="flex items-center justify-center gap-2">
              Request login link <BiSolidLock />
            </span>
          ) : loading ? (
            <span className="flex items-center justify-center gap-2">
              Sending Link{" "}
              <Spinner size="sm" color="white" variant="gradient" />
            </span>
          ) : (
            "Request Login Link"
          )}
        </Button>
      </form>
    </div>
  );
}
