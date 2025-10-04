"use client";

import { User } from "@supabase/supabase-js";
import ExpandableContent from "@/components/ui/ExpandableContent";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import ProfileForm from "./ProfileForm";
import EmailForm from "./EmailForm";
import PasswordForm from "./PasswordForm";
import DangerZone from "./DangerZone";

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

export default function AccountSettingsView({ user, profile }: Props) {
  return (
    <div className="container mx-auto p-8 pt-5 max-w-4xl">
      <div className="mb-8">
        <h1 className="heading-primary text-4xl mb-2">Account Settings</h1>
        <p className="text-white">
          Manage your account information and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Information */}
        <ExpandableContent
          defaultExpanded={true}
          className="p-6"
          chevronPosition="start"
          customHeader={(isExpanded) => (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                {" "}
                <h2 className="heading-secondary text-lg">
                  Profile Information
                </h2>
                <div className="text-gray-600">
                  {isExpanded ? (
                    <MdExpandLess size={20} />
                  ) : (
                    <MdExpandMore size={20} />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Update your public profile details
              </p>{" "}
            </div>
          )}
        >
          <ProfileForm user={user} profile={profile} />
        </ExpandableContent>

        {/* Email Settings */}
        <ExpandableContent
          className="p-6"
          customHeader={(isExpanded) => (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                {" "}
                <h2 className="heading-secondary text-lg">
                  Email Settings
                </h2>
                <div className="text-gray-600">
                  {isExpanded ? (
                    <MdExpandLess size={20} />
                  ) : (
                    <MdExpandMore size={20} />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Manage your email address
              </p>{" "}
            </div>
          )}
        >
          <EmailForm user={user} />
        </ExpandableContent>

        {/* Password Settings */}
        <ExpandableContent
          className="p-6"
          customHeader={(isExpanded) => (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                {" "}
                <h2 className="heading-secondary text-lg">
                  Password Settings
                </h2>
                <div className="text-gray-600">
                  {isExpanded ? (
                    <MdExpandLess size={20} />
                  ) : (
                    <MdExpandMore size={20} />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Change your password
              </p>{" "}
            </div>
          )}
        >
          <PasswordForm user={user} />
        </ExpandableContent>

        {/* Danger Zone */}
        <ExpandableContent
          defaultExpanded={false}
          className="p-6"
          customHeader={(isExpanded) => (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                {" "}
                <h2 className="heading-secondary text-lg">
                  Danger Zone
                </h2>
                <div className="text-gray-600">
                  {isExpanded ? (
                    <MdExpandLess size={20} />
                  ) : (
                    <MdExpandMore size={20} />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Irreversible account actions
              </p>{" "}
            </div>
          )}
        >
          <DangerZone user={user} />
        </ExpandableContent>
      </div>
    </div>
  );
}
