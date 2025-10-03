"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/providers/Providers";
import { PodcastQueries } from "@/lib/queries/podcast-queries";
import { PodcastWithStats } from "@/types/podcast";
import useAnalytics from "@/hooks/useAnalytics";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PodcastHeader from "./PodcastHeader";
import PodcastStats from "./PodcastStats";
import PodcastRSSSection from "./PodcastRSSSection";
import PodcastActions from "./PodcastActions";
import EpisodesList from "./episodes/EpisodesList";
import ExpandableContent from "../ui/ExpandableContent";

export default function PodcastDetailView({ podcastId }: { podcastId: string}) {
  const { user } = useAuth();
  const [podcastData, setPodcastData] = useState<PodcastWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const dataFetchedRef = useRef(false);
  
  const { analytics, loading: analyticsLoading } = useAnalytics(podcastId);

  useEffect(() => {
    if (!user || !podcastId) return;

    // Skip fetching if we already have data for this podcast
    if (dataFetchedRef.current && podcastData?.podcast?.id === podcastId) {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await PodcastQueries.getUserPodcastWithStats(podcastId, user.id);
        
        if (!result) {
          setNotFound(true);
          return;
        }
        
        setPodcastData(result);
        dataFetchedRef.current = true; 
      } catch (error) {
        console.error("Error fetching podcast: ", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, podcastId, podcastData]);

  if (loading || analyticsLoading) {
    return <LoadingSpinner message="Loading podcast..."/>
  }

  if (notFound || !podcastData) {
    return (
      <div className="p-8 text-center">
        <h1>Podcast Not Found</h1>
        <p>This podcast doesn&apos;t exist or you don&apos;t have access to it.</p>
      </div>
    );
  }

  const { podcast, episodeCount } = podcastData;

  return (
    <div className="container mx-auto p-8 pt-5 max-w-4xl">
      <PodcastHeader podcast={podcast} episodeCount={episodeCount} />
      <PodcastStats 
        episodeCount={episodeCount} 
        totalDownloads={analytics.totalDownloads}
        uniqueListeners={analytics.uniqueListeners}
        platformBreakdown={analytics.platformBreakdown}
      />
      <ExpandableContent
        title="Episodes"
        defaultExpanded={true}
        contentClassName="p-0"
      >
        <EpisodesList podcast={podcast} />
      </ExpandableContent>
      <ExpandableContent
        title="RSS Feed & Distribution"
        defaultExpanded={true}
        contentClassName="p-0"
      >
        <PodcastRSSSection podcast={podcast} />
      </ExpandableContent>
      <PodcastActions podcast={podcast} />
    </div>
  );
}
