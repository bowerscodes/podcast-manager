"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import PodcastDetailView from "@/components/podcasts/PodcastDetailView";
import BackButton from "@/components/ui/BackButton";

export default function PodcastDetailPage() {
 
  return (
    <AuthGuard>
      <div className="ml-8 mt-0 mb-0">
        <BackButton to="podcasts" />
      </div>
      <PodcastDetailView />
    </AuthGuard>
  );
};
