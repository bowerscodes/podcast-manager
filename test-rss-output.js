// Quick test to verify RSS output
import { generateRSSFeed } from './src/lib/rss-utils.tsx';

const mockPodcast = {
  id: 'test-id',
  user_id: 'test-user',
  title: 'My Test Podcast',
  description: 'A comprehensive test podcast with all metadata',
  author: 'John Doe',
  email: 'john@example.com',
  website: 'https://example.com',
  artwork: 'https://example.com/artwork.jpg',
  language: 'en',
  explicit: true,
  categories: ['Technology', 'Education', 'Business'],
  created_at: new Date(),
  updated_at: new Date()
};

const mockEpisodes = [
  {
    id: 'ep1',
    title: 'Episode 1: Getting Started',
    description: 'Our first episode covering the basics',
    audio_url: 'https://example.com/episode1.mp3',
    file_size: 15000000,
    duration: 1800,
    publish_date: new Date('2024-01-01'),
    podcast_id: 'test-id',
    explicit: false,
    season_number: '1',
    episode_number: '1',
    status: 'published',
    created_at: new Date()
  },
  {
    id: 'ep2',
    title: 'Episode 2: Advanced Topics',
    description: 'Diving deeper into advanced concepts',
    audio_url: 'https://example.com/episode2.mp3',
    file_size: 20000000,
    duration: 2400,
    publish_date: new Date('2024-01-02'),
    podcast_id: 'test-id',
    explicit: true,
    season_number: '1',
    episode_number: '2',
    status: 'published',
    created_at: new Date()
  }
];

console.log('=== ENHANCED RSS FEED OUTPUT ===');
console.log(generateRSSFeed(mockPodcast, mockEpisodes));
