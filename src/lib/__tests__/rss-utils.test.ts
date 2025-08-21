import { detectPlatform, escapeXml, generateRSSFeed } from '@/lib/rss-utils';
import { Episode } from '@/types/podcast';

describe('RSS Utils', () => {
  describe('detectPlatform', () => {
    it('should detect Apple Podcasts', () => {
      expect(detectPlatform('AppleCoreMedia')).toBe('Apple Podcasts');
      expect(detectPlatform('Mozilla/5.0 AppleCoreMedia/1.0')).toBe('Apple Podcasts');
    });

    it('should detect Spotify', () => {
      expect(detectPlatform('Spotify')).toBe('Spotify');
      expect(detectPlatform('Spotify/1.2.3')).toBe('Spotify');
    });

    it('should detect Overcast', () => {
      expect(detectPlatform('Overcast')).toBe('Overcast');
      expect(detectPlatform('Overcast/1.0')).toBe('Overcast');
    });

    it('should detect Pocket Casts', () => {
      expect(detectPlatform('PocketCasts')).toBe('Pocket Casts');
      expect(detectPlatform('PocketCasts/7.0')).toBe('Pocket Casts');
    });

    it('should return Unknown for unrecognized user agents', () => {
      expect(detectPlatform('Mozilla/5.0')).toBe('Unknown');
      expect(detectPlatform('')).toBe('Unknown');
      expect(detectPlatform('RandomBrowser/1.0')).toBe('Unknown');
    });
  });

  describe('escapeXml', () => {
    it('should escape XML special characters', () => {
      expect(escapeXml('<test>')).toBe('&lt;test&gt;');
      expect(escapeXml('test & more')).toBe('test &amp; more');
      expect(escapeXml('say "hello"')).toBe('say &quot;hello&quot;');
      expect(escapeXml("it's working")).toBe('it&apos;s working');
    });

    it('should handle multiple special characters', () => {
      expect(escapeXml('<title>Test & "Demo"</title>'))
        .toBe('&lt;title&gt;Test &amp; &quot;Demo&quot;&lt;/title&gt;');
    });

    it('should handle empty and normal strings', () => {
      expect(escapeXml('')).toBe('');
      expect(escapeXml('normal text')).toBe('normal text');
      expect(escapeXml('123456')).toBe('123456');
    });
  });

  describe('generateRSSFeed', () => {
    const mockPodcast = {
      id: 'test-id',
      title: 'Test Podcast',
      description: 'A test podcast',
      author: 'Test Author',
      email: 'test@example.com',
      website: 'https://example.com',
      artwork: 'https://example.com/artwork.jpg',
      user_id: 'user-123',
      language: 'en',
      explicit: false,
      categories: ['Technology'],
      created_at: new Date('2024-01-01T00:00:00Z'),
      updated_at: new Date('2024-01-01T00:00:00Z')
    };    const mockEpisodes: Episode[] = [
      {
        id: 'ep1',
        title: 'Episode 1',
        description: 'First episode',
        audio_url: 'https://example.com/episode1.mp3',
        file_size: 10000000,
        duration: 1800, // 30 minutes in seconds
        publish_date: new Date('2024-01-01T00:00:00Z'),
        podcast_id: 'test-id',
        explicit: false,
        created_at: new Date('2024-01-01T00:00:00Z'),
      },
      {
        id: 'ep2',
        title: 'Episode 2',
        description: 'Second episode',
        audio_url: 'https://example.com/episode2.mp3',
        file_size: 15000000,
        duration: 2700, // 45 minutes in seconds
        publish_date: new Date('2024-01-02T00:00:00Z'),
        podcast_id: 'test-id',
        explicit: false,
        created_at: new Date('2024-01-02T00:00:00Z'),
      }
    ];

    beforeEach(() => {
      // Mock environment variable
      process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    });

    it('should generate valid RSS feed with podcast metadata', () => {
      const rss = generateRSSFeed(mockPodcast, mockEpisodes);

      expect(rss).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(rss).toContain('<rss version="2.0"');
      expect(rss).toContain('<title>Test Podcast</title>');
      expect(rss).toContain('<description>A test podcast</description>');
      expect(rss).toContain('<itunes:author>Test Author</itunes:author>');
      expect(rss).toContain('<language>en</language>');
      expect(rss).toContain('<itunes:image href="https://example.com/artwork.jpg" />');
    });

    it('should include all episodes in the feed', () => {
      const rss = generateRSSFeed(mockPodcast, mockEpisodes);

      expect(rss).toContain('<title>Episode 1</title>');
      expect(rss).toContain('<title>Episode 2</title>');
      expect(rss).toContain('<description>First episode</description>');
      expect(rss).toContain('<description>Second episode</description>');
      expect(rss).toContain('<enclosure url="https://example.com/episode1.mp3"');
      expect(rss).toContain('<enclosure url="https://example.com/episode2.mp3"');
    });

    it('should escape XML in podcast and episode data', () => {
      const podcastWithSpecialChars = {
        ...mockPodcast,
        title: 'Test & "Special" Podcast',
        description: 'Description with <tags>'
      };

      const episodeWithSpecialChars = [{
        ...mockEpisodes[0],
        title: 'Episode & "Special" Characters',
        description: 'Description with <tags>'
      }];

      const rss = generateRSSFeed(podcastWithSpecialChars, episodeWithSpecialChars);

      expect(rss).toContain('<title>Test &amp; &quot;Special&quot; Podcast</title>');
      expect(rss).toContain('<description>Description with &lt;tags&gt;</description>');
      expect(rss).toContain('<title>Episode &amp; &quot;Special&quot; Characters</title>');
    });

    it('should handle empty episodes array', () => {
      const rss = generateRSSFeed(mockPodcast, []);

      expect(rss).toContain('<title>Test Podcast</title>');
      expect(rss).toContain('<description>A test podcast</description>');
      expect(rss).not.toContain('<item>');
    });

    it('should handle missing optional episode fields', () => {
      const episodeWithMissingFields = [{
        ...mockEpisodes[0],
        file_size: undefined,
        duration: undefined
      }];

      const rss = generateRSSFeed(mockPodcast, episodeWithMissingFields);

      expect(rss).toContain('length="0"');
      expect(rss).toContain('<itunes:duration>00:00:00</itunes:duration>');
    });

    it('should format publish dates correctly', () => {
      const rss = generateRSSFeed(mockPodcast, mockEpisodes);

      expect(rss).toContain('<pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>');
      expect(rss).toContain('<pubDate>Tue, 02 Jan 2024 00:00:00 GMT</pubDate>');
    });

    it('should use fallback base URL when environment variable is not set', () => {
      delete process.env.NEXT_PUBLIC_BASE_URL;
      const rss = generateRSSFeed(mockPodcast, mockEpisodes);

      expect(rss).toContain('<link>localhost:3000/podcasts/test-id</link>');
    });
  });
});
