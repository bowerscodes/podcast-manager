import { useState, useEffect, useCallback } from 'react';
import { AnalyticsQueries, AnalyticsData } from '@/lib/queries/analytics-queries';

export default function useAnalytics(podcastId: string) {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalDownloads: 0,
    uniqueListeners: 0,
    platformBreakdown: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!podcastId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await AnalyticsQueries.getPodcastAnalytics(podcastId);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics'));
    } finally {
      setLoading(false);
    }
  }, [podcastId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, loading, error, refresh: fetchAnalytics };
}
