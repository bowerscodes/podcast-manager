import { supabase } from "@/lib/supabase";
import { 
  Episode, 
  PodcastWithStats,
  PodcastWithEpisodes,
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
  static async getUserPodcastWithStats(
    podcastId: string,
    userId: string
  ): Promise<PodcastWithStats | null> {
    const { data: podcast, error } = await supabase
      .from("podcasts")
      .select(`
        *,
        episodes(*)
      `)
      .eq("id", podcastId)
      .eq("user_id", userId)
      .single();
      
    if (error || !podcast) return null;

    const podcastWithEpisodes = podcast as unknown as PodcastWithEpisodes;
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
      episodes,
      episodeCount,
      totalDuration,
      seasonCount
    };
  }
}
