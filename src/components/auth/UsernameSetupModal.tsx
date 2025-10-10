"use client";

import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import toast from "react-hot-toast";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/Providers";
import { checkUsernameAvailable, updateProfile, validateUsername } from "@/lib/profileUtils";

type Props = {
  onComplete?: () => void;
};

export default function UsernameSetupModal({ onComplete }: Props) {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  // Fetch profile and determine if modal should be open
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setChecking(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (error) {
        setChecking(false);
        return;
      }

      if (!data?.username) {
        // Prefill with email prefix
        const emailUsername = user.email?.split("@")[0] || "";
        setUsername(emailUsername);
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
      setChecking(false);
    };

    fetchProfile();
  }, [user]);

  // After successful username set, re-fetch profile to close modal if needed
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { valid, error: validationError, cleanUsername } = await validateUsername(username);

      if (!valid) {
        toast.error(validationError);
        setLoading(false);
        return;
      }

      const { available, error: checkError } = await checkUsernameAvailable(cleanUsername, user.id);

      if (checkError) {
        toast.error(checkError);
        setLoading(false);
        return;
      }

      if (!available) {
        toast.error("Username is already taken");
        setLoading(false);
        return;
      }

      const { success, error } = await updateProfile(user.id, {
        username: cleanUsername,
      });

      if (!success) {
        toast.error(error || "Failed to set username");
        setLoading(false);
        return;
      }

      toast.success("Username set successfully");

      // Fire profileUpdated event for cross-component sync
      window.dispatchEvent(
        new CustomEvent("profileUpdated", { detail: { username: cleanUsername } })
      );

      // Re-fetch profile to check if username is now set, and close modal if so
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (data?.username) {
        setIsOpen(false);
        if (onComplete) onComplete();
      }
    } catch (error) {
      console.error("Error setting username:", error);
      toast.error("Failed to set username");
    } finally {
      setLoading(false);
    }
  };

  // Listen for profileUpdated event (in case username is set elsewhere)
  useEffect(() => {
    const handler = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
      if (data?.username) setIsOpen(false);
    };
    window.addEventListener("profileUpdated", handler);
    return () => window.removeEventListener("profileUpdated", handler);
  }, [user]);

  if (checking || !isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={() => {}}
      placement="center"
      isDismissable={false}
      hideCloseButton
    >
      <ModalContent>
        <ModalHeader>
          <h2 className="text-xl heading-secondary font-bold">Set your Username</h2>
        </ModalHeader>
        <ModalBody className="p-6 pt-0">
          <p className="mb-4">
            Please choose a username for your podcasting profile. This will
            appear in your podcast URL.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              label="Username"
              labelPlacement="outside-top"
              startContent={
                <span className="text-gray-500 font-normal">
                  {process.env.NEXT_PUBLIC_BASE_URL}/
                </span>
              }
              isRequired
              minLength={3}
              variant="bordered"
              autoFocus
            />
            <div className="text-sm text-gray-400">
              <span className="font-medium w-full">
                Your podcast URL will look like:
              </span>{" "}
              {window.location.origin}/<strong>{username}</strong>/your-podcast
            </div>
            <Button
              type="submit"
              color="primary"
              className="w-full py-2 px-2 shadow-md font-medium text-white btn-primary bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              isLoading={loading}
            >
              Continue
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
