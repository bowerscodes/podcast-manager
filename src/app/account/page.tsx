"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AccountSettingsView from "@/components/account/AccountSettingsView";
import BackButton from "@/components/ui/BackButton";
import { useAuth } from "@/providers/Providers";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Profile fetch error:", error);
        } else {
          setProfile(profile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (authLoading || loading) {
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
