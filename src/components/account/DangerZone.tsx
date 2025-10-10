"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { deleteUserAccount } from "@/lib/profileUtils";
import { supabase } from "@/lib/supabase";

type Props = {
  user: User;
};

export default function DangerZone({ user }: Props) {
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    if (confirmEmail !== user.email) {
      toast.error("Email confirmation doesn't match");
      return;
    }

    setIsLoading(true);
    try {
      // Delete the user account and all associated data
      const result = await deleteUserAccount(user.id);
      
      if (!result.success) {
        toast.error(result.error || "Failed to delete account");
        setIsLoading(false);
        return;
      }

      // Sign out the user
      await supabase.auth.signOut();
      
      // Show success message
      toast.success("Account deleted successfully");
      
      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="flex flex-col space-y-4 p-4 border gap-4 border-red-200 rounded-lg bg-red-50">
        <div className="text-red-800">
          <h3 className="font-semibold">Delete Account</h3>
          <p className="text-sm mt-1">
            This will permanently delete your account and all associated
            podcasts and episodes. This action cannot be undone.
          </p>
        </div>
        <form autoComplete="off">
          <Input
            name={`confirm-deletion-${user}`}
            label={`Type "${user.email}" to confirm`}
            labelPlacement="outside"
            placeholder={`${user.email}`}
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            variant="bordered"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-1p-ignore
            data-lpignore
            data-form-type="other"
            role="textbox"
            aria-label="Email confirmation for account deletion"
            classNames={{
              base: "max-w-xs",
              label: "!font-semibold !text-gray-600",
              description: "!font-semibold",
            }}
          />
          <Button
            color="danger"
            onPress={handleDeleteAccount}
            isLoading={isLoading}
            isDisabled={confirmEmail !== user.email}
            className="self-start mt-4"
          >
            Delete Account
          </Button>
        </form>
      </div>
    </div>
  );
}
