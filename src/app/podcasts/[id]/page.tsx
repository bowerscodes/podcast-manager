"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import PodcastDetailView from "@/components/podcasts/PodcastDetailView";

export default function PodcastDetailPage() {
 
  return (
    <AuthGuard>
      <PodcastDetailView />
    </AuthGuard>
  );
};
