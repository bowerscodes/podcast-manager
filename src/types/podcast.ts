export interface Podcast {
  id: string;
  user_id: string;
  title: string;
  podcast_name: string;
  description: string;
  artwork: string;
  website?: string;
  language: string;
  explicit: boolean;
  categories: string[];
  author: string;
  email: string;
  created_at: Date;
  updated_at: Date;
};

export interface Episode {
  id: string;
  podcast_id: string;
  title: string;
  description: string;
  audio_url: string; 
  duration?: number; 
  file_size?: number; 
  publish_date: Date;
  season_number?: string;
  episode_number?: string;
  explicit: boolean;
  status: "draft" | "published";
  created_at: Date;
};

export type PodcastWithStats = {
  podcast: Podcast;
  episodeCount: number;
  totalDuration: number;
  seasonCount: number;
  episodes?: Episode[];
}

export type PodcastWithEpisodes = Podcast & {
  episodes: Episode[];
};

export type PodcastWithCount = Podcast & {
  episodes: { count: number }[];
};

export interface PodcastFormData {
  id?: string;
  title: string;
  podcast_name?: string;
  description: string;
  author: string;
  email: string;
  website: string;
  artwork: string;
  categories: string[];
  explicit: boolean;
};

export interface EpisodeFormData {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  season_number?: string;
  episode_number?: string;
  explicit: boolean;
  status: "draft" | "published";
};
