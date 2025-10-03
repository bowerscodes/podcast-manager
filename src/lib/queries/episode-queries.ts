import { supabase } from "@/lib/supabase";
import { Episode } from "@/types/podcast";

export class EpisodeQueries {
  // Get a single episode with all details
  static async getEpisodeById(episodeId: string): Promise<Episode | null> {
    const { data, error } = await supabase
      .from("episodes")
      .select("*")
      .eq("id", episodeId)
      .single();
    
    if (error) return null;
    return data as Episode;
  }

  // Get all episodes for a podcast with optional filtering
  static async getEpisodesByPodcast(
    podcastId: string,
    options?: {
      seasonNumber?: string;
      status?: "draft" | "published";
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<Episode[]> {

    if (!podcastId) return [];
    
    let query = supabase
      .from("episodes")
      .select("*")
      .eq("podcast_id", podcastId);
    
    if (options?.seasonNumber) {
      query = query.eq("season_number", options.seasonNumber);
    }
    
    if (options?.status) {
      query = query.eq("status", options.status);
    }
    
    const sortBy = options?.sortBy || "publish_date";
    const sortOrder = options?.sortOrder || "desc";
    query = query.order(sortBy, { ascending: sortOrder === "asc" });
    
    const { data, error } = await query;
    if (error) return [];
    return data as Episode[];
  }
}
