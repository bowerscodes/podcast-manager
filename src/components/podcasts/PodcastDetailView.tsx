"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { useAuth } from "@/providers/Providers";
import { supabase } from "@/lib/supabase";
import { Podcast } from "@/types/podcast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PodcastHeader from "./PodcastHeader";
import PodcastStats from "./PodcastStats";
import PodcastRSSSection from "./PodcastRSSSection";
import PodcastActions from "./PodcastActions";

interface AnalyticsData {
  totalDownloads: number;
  uniqueListeners: number;
  platformBreakdown: Record<string, number>
};

export default function PodcastDetailView() {
  const params = useParams();
  const { user } = useAuth();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [episodeCount, setEpisodeCount] = useState(0);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalDownloads: 0,
    uniqueListeners: 0,
    platformBreakdown: {}
  });
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const podcastId = params.id as string;

  useEffect(() => {
    if (!user || !podcastId) return;

    const fetchData = async () => {
      try {
        const { data: podcastData, error: podcastError } = await supabase
          .from("podcasts")
          .select("*")
          .eq("id", podcastId)
          .eq("user_id", user.id)
          .single();

        if (podcastError || !podcastData) {
          setNotFound(true);
          return;
        }

        const { count, error: countError } = await supabase
          .from("episodes")
          .select("*", { count: "exact", head: true })
          .eq("podcast_id", podcastId);

        if (countError) {
          console.error("Error fetching episode count: ", countError);
        }

        const { data: analyticsData, error: analyticsError } = await supabase
          .from("analytics")
          .select("*")
          .eq("podcast_id", podcastId);

        let analyticsResult: AnalyticsData = {
          totalDownloads: 0,
          uniqueListeners: 0,
          platformBreakdown: {}
        };

        if (!analyticsError && analyticsData) {
          //Calculate unique listeners by IP
          const uniqueIPs = new Set(analyticsData.map(a => a.ip_address));

          // Calculate total downloads / RSS accesses
          const totalDownloads = analyticsData.filter(a => a.event_type === "rss_access").length;

          // Calculate platform breakdown
          const platformBreakdown = analyticsData.reduce((acc, curr) => {
            if (curr.platform && curr.event_type == "rss_access") {
              acc[curr.platform] = (acc[curr.platform] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>);

          analyticsResult = {
            totalDownloads,
            uniqueListeners: uniqueIPs.size,
            platformBreakdown
          };
        }

        setPodcast(podcastData);
        setEpisodeCount(count || 0);
        setAnalytics(analyticsResult);
      } catch (error) {
        console.error("Error fetching podcast: ", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, podcastId]);

  if (loading) {
    return <LoadingSpinner message="Loading podcast..."/>
  }

  if (notFound || !podcast) {
    return (
      <div className="p-8 text-center">
        <h1>Podcast Not Found</h1>
        <p>This podcast doesn&apos;t exist or you don&apos;t have access to it.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <PodcastHeader podcast={podcast} episodeCount={episodeCount} />
      <PodcastStats 
        episodeCount={episodeCount} 
        totalDownloads={analytics.totalDownloads}
        uniqueListeners={analytics.uniqueListeners}
        platformBreakdown={analytics.platformBreakdown}
      />
      <PodcastRSSSection podcast={podcast} />
      <PodcastActions podcast={podcast} />
    </div>
  );
};
