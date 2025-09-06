/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

// Mock NextRequest
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, options = {}) => ({
    url,
    method: options.method || 'GET',
    headers: new Map(Object.entries(options.headers || {})),
    json: jest.fn().mockResolvedValue({}),
    text: jest.fn().mockResolvedValue(''),
    nextUrl: {
      pathname: new URL(url).pathname,
      searchParams: new URLSearchParams(new URL(url).search)
    }
  })),
  NextResponse: jest.fn().mockImplementation((body, init = {}) => ({
    text: jest.fn().mockResolvedValue(body),
    json: jest.fn().mockResolvedValue(() => {
      try {
        return typeof body === 'string' ? JSON.parse(body) : body;
      } catch {
        return {};
      }
    }),
    status: init.status || 200,
    headers: new Map(Object.entries(init.headers || {}))
  }))
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.NEXT_PUBLIC_BASE_URL = 'https://test.com';

// Mock RSS utils
jest.mock('@/lib/rss-utils', () => ({
  generateRSSFeed: jest.fn().mockImplementation((podcast: Podcast, episodes: Episode[]) => {
    // Create comprehensive RSS content that includes all the data we're testing
    const itunesCategories = podcast.categories.map(category => 
      `<itunes:category text="${category}" />`
    ).join('');
    
    const episodeItems = episodes.map((ep) => 
      `<item>
        <title>${ep.title}</title>
        <description>${ep.description}</description>
        <enclosure url="${ep.audio_url}"/>
        <itunes:explicit>${ep.explicit ? 'true' : 'false'}</itunes:explicit>
        ${ep.season_number ? `<itunes:season>${ep.season_number}</itunes:season>` : ''}
        ${ep.episode_number ? `<itunes:episode>${ep.episode_number}</itunes:episode>` : ''}
      </item>`
    ).join('');
    
    return `<rss>
      <channel>
        <title>${podcast.title}</title>
        <description>${podcast.description}</description>
        <itunes:author>${podcast.author}</itunes:author>
        <itunes:email>${podcast.email}</itunes:email>
        <itunes:explicit>${podcast.explicit ? 'true' : 'false'}</itunes:explicit>
        ${itunesCategories}
        ${podcast.website ? `<itunes:link href="${podcast.website}" />` : ''}
        ${episodeItems}
      </channel>
    </rss>`;
  }),
  detectPlatform: jest.fn().mockReturnValue('Web')
}));

// Mock Supabase - Copy the working approach from route.test.ts
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ data: {}, error: null })
    }))
  }
}));

// Track mock data that can be changed in tests - use const with mutations
const mockPodcastData: Podcast[] = [];
const mockEpisodeData: Episode[] = [];

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn((table: string) => {
      if (table === 'podcasts') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ 
              data: mockPodcastData, 
              error: null 
            }))
          }))
        };
      }
      if (table === 'episodes') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn((field: string, value: string) => ({
                order: jest.fn((orderField: string, orderOptions?: { ascending: boolean }) => {
                  // Filter episodes by status = "published" (simulating the real database filter)
                  let filteredData = [...mockEpisodeData];
                  if (field === 'status' && value === 'published') {
                    filteredData = mockEpisodeData.filter((ep: Episode) => ep.status === 'published');
                  }
                  
                  // Sort by publish_date desc (simulating the real database ordering)
                  if (orderField === 'publish_date' && orderOptions?.ascending === false) {
                    filteredData.sort((a: Episode, b: Episode) => 
                      new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()
                    );
                  }
                  
                  return Promise.resolve({ 
                    data: filteredData, 
                    error: null 
                  });
                })
              }))
            }))
          }))
        };
      }
      return {
        insert: jest.fn().mockResolvedValue({ data: {}, error: null })
      };
    })
  }))
}));

// Now import the route
import { GET } from '../route';
import { Podcast, Episode } from '@/types/podcast';

describe('RSS Feed Integration Tests', () => {
  beforeEach(() => {
    // Reset mock data before each test
    mockPodcastData.length = 0;
    mockEpisodeData.length = 0;
  });

  const mockPodcast: Podcast = {
    id: 'test-podcast-id',
    user_id: 'test_user_id',
    title: 'Test Podcast',
    description: 'Test Description',
    author: 'Test Author',
    email: 'test@example.com',
    website: 'https://example.com',
    artwork: 'https://example.com/artwork.jpg',
    language: 'en',
    explicit: false,
    categories: ['Technology'],
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  };

  const mockEpisode: Episode = {
    id: 'ep1',
    podcast_id: 'test-podcast-id',
    title: 'Episode 1',
    description: 'First episode',
    audio_url: 'https://example.com/episode1.mp3',
    publish_date: new Date('2024-01-01'),
    status: 'published',
    season_number: '1',
    episode_number: '1',
    explicit: false,
    created_at: new Date('2024-01-01')
  };

  it('should include newly published episodes in RSS feed', async () => {
    // Set up mock data
    mockPodcastData.push(mockPodcast);
    mockEpisodeData.push(mockEpisode);

    const request = new NextRequest('http://localhost/api/rss/test-podcast-id');
    const response = await GET(request, { params: Promise.resolve({ podcastId: 'test-podcast-id' }) });
    
    const rssContent = await response.text();
    
    expect(response.status).toBe(200);
    expect(rssContent).toContain('<title>Episode 1</title>');
    expect(rssContent).toContain('<description>First episode</description>');
    expect(rssContent).toContain('https://example.com/episode1.mp3');
  });

  it('should exclude draft episodes from RSS feed', async () => {
    const draftEpisode: Episode = { ...mockEpisode, status: 'draft' };
    
    // Set up mock data with podcast but draft episode (which should be filtered out)
    mockPodcastData.push(mockPodcast);
    mockEpisodeData.push(draftEpisode);

    const request = new NextRequest('http://localhost/api/rss/test-podcast-id');
    const response = await GET(request, { params: Promise.resolve({ podcastId: 'test-podcast-id' }) });
    
    const rssContent = await response.text();
    
    expect(response.status).toBe(200);
    expect(rssContent).not.toContain('<title>Episode 1</title>'); // Draft episode should not appear
    expect(rssContent).toContain('<title>Test Podcast</title>'); // Podcast info should still be there
  });

  it('should reflect episode updates in RSS feed', async () => {
    const updatedEpisode: Episode = { 
      ...mockEpisode, 
      title: 'Updated Episode Title',
      description: 'Updated description'
    };
    
    // Set up mock data
    mockPodcastData.push(mockPodcast);
    mockEpisodeData.push(updatedEpisode);

    const request = new NextRequest('http://localhost/api/rss/test-podcast-id');
    const response = await GET(request, { params: Promise.resolve({ podcastId: 'test-podcast-id' }) });
    
    const rssContent = await response.text();
    
    expect(rssContent).toContain('<title>Updated Episode Title</title>');
    expect(rssContent).toContain('<description>Updated description</description>');
  });

  it('should handle episode deletion (episode no longer appears in RSS)', async () => {
    // Set up mock data with podcast but no episodes (simulating deletion)
    mockPodcastData.push(mockPodcast);
    // Don't add any episodes to mockEpisodeData

    const request = new NextRequest('http://localhost/api/rss/test-podcast-id');
    const response = await GET(request, { params: Promise.resolve({ podcastId: 'test-podcast-id' }) });
    
    const rssContent = await response.text();
    
    expect(response.status).toBe(200);
    expect(rssContent).not.toContain('<item>'); // No episode items
    expect(rssContent).toContain('<title>Test Podcast</title>'); // Podcast info still there
  });

  it('should maintain episode order in RSS (newest first)', async () => {
    const episodes: Episode[] = [
      { ...mockEpisode, id: 'ep1', title: 'Episode 1', publish_date: new Date('2024-01-01') },
      { ...mockEpisode, id: 'ep2', title: 'Episode 2', publish_date: new Date('2024-01-02') },
      { ...mockEpisode, id: 'ep3', title: 'Episode 3', publish_date: new Date('2024-01-03') }
    ];
    
    // Set up mock data
    mockPodcastData.push(mockPodcast);
    episodes.forEach(ep => mockEpisodeData.push(ep));

    const request = new NextRequest('http://localhost/api/rss/test-podcast-id');
    const response = await GET(request, { params: Promise.resolve({ podcastId: 'test-podcast-id' }) });
    
    const rssContent = await response.text();
    
    const episode3Index = rssContent.indexOf('<title>Episode 3</title>');
    const episode2Index = rssContent.indexOf('<title>Episode 2</title>');
    const episode1Index = rssContent.indexOf('<title>Episode 1</title>');
    
    expect(episode3Index).toBeLessThan(episode2Index);
    expect(episode2Index).toBeLessThan(episode1Index);
  });

  it('should include comprehensive podcast metadata in RSS feed', async () => {
    const fullPodcast: Podcast = {
      ...mockPodcast,
      explicit: true,
      categories: ['Technology', 'Education'],
      website: 'https://example.com'
    };

    const fullEpisode: Episode = {
      ...mockEpisode,
      explicit: true,
      season_number: '2',
      episode_number: '5'
    };
    
    // Set up mock data
    mockPodcastData.push(fullPodcast);
    mockEpisodeData.push(fullEpisode);

    const request = new NextRequest('http://localhost/api/rss/test-podcast-id');
    const response = await GET(request, { params: Promise.resolve({ podcastId: 'test-podcast-id' }) });
    
    const rssContent = await response.text();
    
    // Check podcast-level metadata
    expect(rssContent).toContain('<itunes:author>Test Author</itunes:author>');
    expect(rssContent).toContain('<itunes:email>test@example.com</itunes:email>');
    expect(rssContent).toContain('<itunes:explicit>true</itunes:explicit>');
    expect(rssContent).toContain('<itunes:category text="Technology" />');
    expect(rssContent).toContain('<itunes:category text="Education" />');
    expect(rssContent).toContain('<itunes:link href="https://example.com" />');
    
    // Check episode-level metadata
    expect(rssContent).toContain('<itunes:season>2</itunes:season>');
    expect(rssContent).toContain('<itunes:episode>5</itunes:episode>');
  });
});
