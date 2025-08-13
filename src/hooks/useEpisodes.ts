import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { Episode } from '@/types/podcast';

export default function useEpisodes(podcastId: string) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!podcastId) return;
    setLoading(true);
    supabase
      .from("episodes")
      .select("*")
      .eq("podcast_id", podcastId)
      .order("publish_date", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error);
        setEpisodes(data || []);
        setLoading(false);
      });
  }, [podcastId]);

  return { episodes, loading, error };
};
