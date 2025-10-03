import { useState, useEffect, useCallback } from 'react';

import { PodcastQueries } from '@/lib/queries/podcast-queries';
import { PodcastWithStats } from '@/types/podcast';

export default function usePodcast(podcastId: string) {
  const [data, setData] = useState<PodcastWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await PodcastQueries.getPodcastWithStats(podcastId);
      setData(result);
    } catch (error) {
      setError(error instanceof Error ? error : new Error("Failed to fetch podcast"));
    } finally {
      setLoading(false);
    }
  }, [podcastId]);

  useEffect(() => {
    refresh();
  }, [podcastId, refresh]);

  return {
    podcast: data?.podcast,
    episodes: data?.episodes,
    episodeCount: data?.episodeCount,
    totalDuration: data?.totalDuration,
    seasonCount: data?.seasonCount,
    loading,
    error,
    refresh
  };
};
