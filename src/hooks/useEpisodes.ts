import { useEffect, useState, useCallback } from 'react';

import { supabase } from '@/lib/supabase';
import { Episode } from '@/types/podcast';

export default function useEpisodes(podcastId: string) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEpisodes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("episodes")
      .select("*")
      .eq("podcast_id", podcastId)
      .order("publish_date", { ascending: true })
    
    if (error) setError(error);
    setEpisodes(data || []);
    setLoading(false);
  }, [podcastId]);

  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes]);

  return { episodes, loading, error, refresh: fetchEpisodes };
};
