import { useEffect, useState, useCallback } from 'react';

import { EpisodeQueries } from '@/lib/queries/episode-queries';
import { Episode } from '@/types/podcast';

export default function useEpisodes(
  podcastId: string,
  seasonNumber?: string,
  status?: "draft" | "published"
) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEpisodes = useCallback(async () => {
    if (!podcastId) {
      setEpisodes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await EpisodeQueries.getEpisodesByPodcast(podcastId, {
        seasonNumber,
        status
      });
      setEpisodes(data);
    } catch (error) {
      setError(error instanceof Error ? error : new Error("Failed to fetch episodes"));
    } finally {
      setLoading(false);
    }
  }, [podcastId, seasonNumber, status]);

  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes]);

  return { episodes, loading, error, refresh: fetchEpisodes };
};
