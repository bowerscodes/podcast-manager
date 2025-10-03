import { supabase } from "@/lib/supabase";

export interface AnalyticsData {
  totalDownloads: number;
  uniqueListeners: number;
  platformBreakdown: Record<string, number>;
}

export class AnalyticsQueries {
  static async getPodcastAnalytics(podcastId: string): Promise<AnalyticsData> {
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
      // Calculate unique listeners by IP
      const uniqueIPs = new Set(analyticsData.map(a => a.ip_address));

      // Calculate total downloads / RSS accesses
      const totalDownloads = analyticsData.filter(a => a.event_type === "rss_access").length;

      // Calculate platform breakdown
      const platformBreakdown = analyticsData.reduce((acc, curr) => {
        if (curr.platform && curr.event_type === "rss_access") {
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

    return analyticsResult;
  }
}
