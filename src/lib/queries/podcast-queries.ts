import { supabase } from "@/lib/supabase";
import { 
  Podcast, 
  Episode, 
  PodcastWithStats,
  PodcastWithEpisodes,
  PodcastWithCount
} from "@/types/podcast";


export class PodcastQueries {
  // Get podcast with all related data in a single optimized query
  static async getPodcastWithStats(
    podcastId: string,
  ): Promise<PodcastWithStats | null> {
    const { data: podcast, error } = await supabase
      .from("podcasts")
      .select(`
        *,
        episodes(*)
      `)
      .eq("id", podcastId)
      .single();
    
    if (error || !podcast) return null;

    const podcastWithEpisodes = podcast as unknown as PodcastWithEpisodes
    const episodes = podcastWithEpisodes.episodes || [];
    const episodeCount = episodes.length;
    const totalDuration = episodes.reduce(
      (sum: number, ep: Episode) => sum + (ep.duration || 0),
      0
    );
    const seasonCount = new Set(
      episodes.map((ep: Episode) => ep.season_number).filter(Boolean)
    ).size;

    return {
      podcast: podcastWithEpisodes,
      episodes: episodes,
      episodeCount,
      totalDuration,
      seasonCount
    };
  }

  // Get all podcasts for a user with basic stats
  static async getUserPodcastsWithstats(userId: string) {
    const { data: podcasts, error } = await supabase
      .from("podcasts")
      .select(`4
        *,
        episodes(count)  
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

      if (error) throw error;

      return (podcasts as unknown as PodcastWithCount[])?.map((podcast) => {
        const { episodes, ...podcastData } = podcast;
        return {
          ...podcastData,
          episodeCount: episodes?.[0]?.count || 0,
        };
      }) as (Podcast & { episodeCount: number })[];
  }
}
