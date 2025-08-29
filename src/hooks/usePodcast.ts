import { useState, useEffect, useCallback } from 'react';

import { supabase } from '@/lib/supabase';
import { Podcast } from '@/types/podcast';

export default function usePodcast(podcastId: string, userId?: string) {
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPodcast = useCallback(async () => {
    if (!podcastId) return;

    setLoading(true);
    const query = supabase
      .from("podcasts")
      .select("*")
      .eq("id", podcastId);

      if (userId) {
        query.eq("user_id", userId);
      }

      const { data, error } = await query.single();

      if (error) setError(error);
      setPodcast(data || null);
      setLoading(false);
  }, [podcastId, userId]);

  useEffect(() => {
    fetchPodcast();
  }, [fetchPodcast]);

  return { podcast, loading, error, refresh: fetchPodcast };
};
