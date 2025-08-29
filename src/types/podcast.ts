export interface Podcast {
  id: string;
  user_id: string;
  title: string;
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
  audio_url: string; // User's self-hosted URL
  duration?: number; // in seconds
  file_size?: number; // in bytes
  publish_date: Date;
  season_number?: string;
  episode_number?: string;
  explicit: boolean;
  created_at: Date;
};

export interface PodcastFormData {
  id?: string;
  title: string;
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
};
