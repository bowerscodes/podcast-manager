"use client";

import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

import { useAuth } from "@/providers/Providers";
import { checkUsernameAvailable, updateProfile, validateUsername } from "@/lib/profileUtils";

export default function UsernameSetupModal() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if the user needs to set up a username
  useEffect(() => {
    if (!user) return;

    const checkUsername = async () => {
      setIsChecking(true);
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      // If no username exists, show the modal
      if (!data?.username) {
        const emailUsername = user.email?.split("@")[0] || "";
        const suggestedUsername = emailUsername
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-");

        setUsername(suggestedUsername);
        setIsOpen(true);
      }
      setIsChecking(false);
    };

    checkUsername();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Use shared validation function
      const { valid, error: validationError, cleanUsername } = await validateUsername(username);
      
      if (!valid) {
        toast.error(validationError);
        setLoading(false);
        return;
      }

      // Check if username is already taken
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

      // Use shared update function
      const { success, error } = await updateProfile(user.id, {
        username: cleanUsername,
      });

      if (!success) {
        toast.error(error || "Failed to set username");
        setLoading(false);
        return;
      }

      toast.success("Username set successfully");
      setIsOpen(false);
    } catch (error) {
      console.error("Error setting username:", error);
      toast.error("Failed to set username");
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything if still checking, or if the modal shouldn't be shown
  if (isChecking || !isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        // Only allow closing if a username is set!
        if (!open && !username) {
          toast.error("Please set a username to continue");
          return;
        }
        setIsOpen(open);
      }}
      placement="center"
      isDismissable={false}
      hideCloseButton
    >
      <ModalContent>
        <ModalHeader>
          <h2 className="text-xl font-bold">Set your Username</h2>
        </ModalHeader>
        <ModalBody className="p-6">
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
            />
            <div className="text-sm text-gray-400">
              <span className="font-medium w-full">
                Your podcast URL will look like:
              </span>{" "}
              {window.location.origin}/{username}/your-podcast
            </div>
            <Button
              type="submit"
              color="primary"
              className="w-full"
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
