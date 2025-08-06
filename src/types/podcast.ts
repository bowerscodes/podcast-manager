export interface Podcast {
  id: string;
  userId: string;
  title: string;
  description: string;
  artwork: string;
  website?: string;
  language: string;
  categories: string[];
  author: string;
  email: string;
  rssUrl: string; // Generated RSS URL
  createdAt: Date;
  updatedAt: Date;
};

export interface Episode {
  id: string;
  podcastId: string;
  title: string;
  description: string;
  audioUrl: string; // User's self-hosted URL
  duration: number; // in seconds
  fileSize: number; // in bytes
  publishDate: Date;
  seasonNumber?: number;
  episodeNumber?: number;
  explicit: boolean;
  createdAt: Date;
};
