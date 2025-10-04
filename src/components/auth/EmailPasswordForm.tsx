"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

type Props = {
  isSignUp: boolean;
  onToggleMode: () => void;
  onSuccess?: () => void;
};

export default function EmailPasswordForm({ isSignUp, onToggleMode, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

// Temporary debugging - add this to your login form to see what's happening
console.log("Attempting login with email:", email);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Please check your email for a confirmation link");
        onSuccess?.();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        onSuccess?.();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    };
  };

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>
      <form onSubmit={handleEmailAuth} className="space-y-6">
        <div className="flex flex-col gap-4">
        <Input
          type="email"
          label="Email"
          labelPlacement="outside"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant="bordered"
          classNames={{
            base: "",
            label: "!font-semibold !text-gray-600",
            description: "!font-semibold",
          }}
          required
        />
        <Input
          type="password"
          label="Password"
          labelPlacement="outside"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant="bordered"
          classNames={{
            base: "",
            label: "!font-semibold !text-gray-600",
            description: "!font-semibold",
          }}
          required
        />
        </div>
        <Button 
          type="submit" 
          className="w-full font-bold" 
          color="primary"
          isLoading={loading}
        >
          {isSignUp ? "Sign up" : "Login"}
        </Button>
      </form>
      <div className="text-center">
        <button
          type="button"
          className="text-sm text-blue-500 hover:underline"
          onClick={onToggleMode}
        >
          {isSignUp
            ? "Already have an account? Login"
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </>
  );
};
