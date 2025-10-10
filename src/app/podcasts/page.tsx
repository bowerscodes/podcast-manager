"use client";

import { Button } from "@heroui/button";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/providers/Providers";
import { Podcast } from "@/types/podcast";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PodcastCard from "../../components/podcasts/PodcastCard";
import PlaceholderPodcastCard from "@/components/podcasts/PlaceholderPodcastCard";
import PodcastModal from "@/components/modals/PodcastModal";
import { PodcastQueries } from "@/lib/queries/podcast-queries";

export default function PodcastsList() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);

 // Auth protection useEffect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const fetchPodcasts = useCallback(async () => {
    if (!user) return;

    if (!hasLoadedData) {
      setDataLoading(true);
    }
    
    try {
      const data = await PodcastQueries.getPodcastsByUser(user.id)
      setPodcasts(data);
      setHasLoadedData(true);
    } catch (error) {
      console.error("Error fetching podcasts: ", error);
      toast.error("Failed to load podcasts. Please refresh the page.")
    } finally {
      setDataLoading(false);
    }
  }, [user, hasLoadedData]);

  useEffect(() => {
    fetchPodcasts();
  }, [fetchPodcasts]);

  const handlePodcastCreated = () => {
    fetchPodcasts();
    setIsCreateModalOpen(false);
  }

  // Show loading only on initial auth check - not on tab switches
  if (authLoading && !user) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  // Don't render anything if redirecting
  if (!user) {
    return null;
  }
  
  // Show loading only on first data fetch
  if (dataLoading && !hasLoadedData) {
    return <LoadingSpinner message="Loading podcasts..." />;
  }

  return (
    <>
      <div className="page-container">
        <div className="mb-8">
          <h1 className="heading-primary">Podcasts</h1>
        </div>
        {podcasts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl mb-4 heading-secondary">No podcasts yet</h2>
            <p className="text-muted mb-6">
              Create your first podcast to get started
            </p>
            <Button color="primary" onPress={() => setIsCreateModalOpen(true)}>
              Create Podcast
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {podcasts.map((podcast) => (
              <PodcastCard key={podcast.id} podcast={podcast}/>
            ))}
            <PlaceholderPodcastCard 
              isFirstInList={podcasts.length === 0}
              onCreateClick={(() => setIsCreateModalOpen(true))}
            />
          </div>
        )}
      </div>

      <PodcastModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handlePodcastCreated}
        initialData={{}}
      />
    </>
  );
};
