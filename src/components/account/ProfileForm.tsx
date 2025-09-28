"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Checkbox } from "@heroui/checkbox";

import {
  checkUsernameAvailable,
  updateProfile,
  validateUsername,
} from "@/lib/profileUtils";

type Profile = {
  id: string;
  username: string;
  display_name?: string;
  created_at: string;
  updated_at: string;
};

type Props = {
  user: User;
  profile: Profile | null;
};

export default function ProfileForm({ user, profile }: Props) {
  const [username, setUsername] = useState(profile?.username || "");
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [isLoading, setIsLoading] = useState(false);

  // For the confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [hasAcknowledgedRssChange, setHasAcknowledgedRssChange] =
    useState(false);
  const [hasAcknowledgedResubmission, setHasAcknowledgedResubmission] =
    useState(false);

  const originalUsername = profile?.username || "";
  const isUsernameChanged =
    username.toLowerCase().trim() !== originalUsername.toLowerCase();

  const handleSave = async () => {
    if (isUsernameChanged) {
      setIsConfirmModalOpen(true);
      return;
    } else {
      await saveChanges();
    }
  };

  const saveChanges = async () => {
    setIsLoading(true);

    try {
      const {
        valid,
        error: validationError,
        cleanUsername,
      } = await validateUsername(username);

      if (!valid) {
        toast.error(validationError);
        setIsLoading(false);
        return;
      }

      const currentUsername = profile?.username?.toLowerCase() || "";

      // Check if username is taken (if changed)
      if (cleanUsername !== currentUsername) {
        const { available, error: checkError } = await checkUsernameAvailable(
          cleanUsername,
          user.id
        );

        if (checkError) {
          toast.error(checkError);
          setIsLoading(false);
          return;
        }

        if (!available) {
          toast.error("Username is already taken");
          setIsLoading(false);
          return;
        }
      }

      // Update profile
      const { success, error } = await updateProfile(user.id, {
        username: cleanUsername,
        display_name: displayName.trim() || null,
      });

      if (!success) {
        toast.error(error || "Failed to update profile");
        setIsLoading(false);
        return;
      }

      toast.success("Profile updated successfully");

      window.dispatchEvent(new CustomEvent("profileUpdated"));
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
      setIsConfirmModalOpen(false);
      resetConfirmationState();
    }
  };

  const handleConfirmationSubmit = () => {
    if (confirmEmail !== user.email) {
      toast.error("Email doesn't match your account email");
      return;
    }

    saveChanges();
  };

  const isConfirmationComplete =
    confirmEmail.trim().toLowerCase() === user.email?.trim().toLowerCase() &&
    hasAcknowledgedRssChange &&
    hasAcknowledgedResubmission;

  const resetConfirmationState = () => {
    setConfirmEmail("");
    setHasAcknowledgedRssChange(false);
    setHasAcknowledgedResubmission(false);
  };

  return (
    <>
      <div className="flex flex-col gap-4 pt-6">
        <Input
          label="Username"
          labelPlacement="outside"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          variant="bordered"
          classNames={{
            base: "max-w-sm",
            label: "!font-semibold !text-gray-600",
            description: "!font-semibold",
          }}
          startContent={
            <span className="text-gray-500">
              {process.env.NEXT_PUBLIC_BASE_URL}/
            </span>
          }
          description="This appears in your podcast URLs"
          color={isUsernameChanged ? "warning" : undefined}
        />

        {isUsernameChanged && (
          <div className="text-sm text-amber-500 font-medium -mt-2 max-w-sm">
            ⚠️ Changing your username will break existing RSS feed links and
            require resubmission to podcast platforms.
          </div>
        )}

        <Input
          label="Display Name"
          labelPlacement="outside"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          variant="bordered"
          classNames={{
            base: "max-w-2xs",
            label: "!font-semibold !text-gray-600",
            description: "!font-semibold",
          }}
          description="Your public display name (optional)"
        />
        <Button
          color={isUsernameChanged ? "warning" : "primary"}
          onPress={handleSave}
          isLoading={isLoading}
          className="self-start"
          startContent={isUsernameChanged ? "🔒" : undefined}
        >
          {isUsernameChanged ? "Verify & Save Changes" : "Save Changes"}
        </Button>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          resetConfirmationState();
        }}
        placement="center"
        size="lg"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-red-500">
              Warning: Changing Your Username
            </h3>
            <p className="text-sm text-gray-500">
              This action has significant consequences for your podcasts
            </p>
          </ModalHeader>
          <ModalBody>
            <div className="flex-col space-y-4">
              <div className="flex flex-col bg-amber-50 p-4 rounded-md border border-amber-200 text-amber-800">
                <p className="font-semibold text-center">
                  You are changing your username from:
                </p>
                <div className="mt-2 flex items-center justify-center">
                  <p className="font-mono bg-gray-100 px-2 py-1 rounded">
                    {originalUsername}
                  </p>
                  <span className="mx-2">→</span>
                  <p className="font-mono bg-gray-100 px-2 py-1 rounded">
                    {username}
                  </p>
                </div>
              </div>
              <p className="font-medium">Changing your username will:</p>

              <div className="space-y-2">
                <Checkbox
                  isSelected={hasAcknowledgedRssChange}
                  onValueChange={setHasAcknowledgedRssChange}
                  color="danger"
                >
                  <span className="text-red-600 font-medium">
                    Break all existing RSS feed URLs for your podcasts
                  </span>
                </Checkbox>

                <Checkbox
                  isSelected={hasAcknowledgedResubmission}
                  onValueChange={setHasAcknowledgedResubmission}
                  color="danger"
                >
                  <span className="text-red-600 font-medium">
                    Require manual resubmission to Apple Podcasts, Spotify, and
                    other platforms
                  </span>
                </Checkbox>
              </div>

              <div className="mt-4">
                <p className="font-medium">
                  To confirm this change, please enter the email address
                  associated with this account:
                </p>
                <Input
                  placeholder="Type your email address to confirm"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  className="mt-2"
                  autoComplete="new-password" // This tricks browsers better than "off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  name={`confirm-email-${Math.random()
                    .toString(36)
                    .substring(2, 8)}`} // Random name prevents matching
                  spellCheck="false"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => {
                setIsConfirmModalOpen(false);
                resetConfirmationState();
              }}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleConfirmationSubmit}
              isDisabled={!isConfirmationComplete}
              isLoading={isLoading}
            >
              Confirm Username Change
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
