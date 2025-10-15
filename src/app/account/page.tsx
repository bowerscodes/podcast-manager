"use client";

import { useRouter } from "next/navigation";
import AccountSettingsView from "@/components/account/AccountSettingsView";
import BackButton from "@/components/ui/BackButton";
import { useAuth } from "@/providers/Providers";
import { useEffect } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useProfile } from "@/hooks/useProfile";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  if (authLoading || profileLoading) {
    return <LoadingSpinner message="Loading account..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="ml-8 mt-0 mb-0">
        <BackButton />
      </div>
      <AccountSettingsView user={user} profile={profile} />
    </>
  );
}
