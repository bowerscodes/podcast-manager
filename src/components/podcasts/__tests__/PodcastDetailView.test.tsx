import { render, screen, waitFor } from '@testing-library/react';
import PodcastDetailView from '../PodcastDetailView';
import { useAuth } from '@/providers/Providers';
import { supabase } from '@/lib/supabase';

// Mock Next.js router
const mockParams = { id: 'test-podcast-id' };
jest.mock('next/navigation', () => ({
  useParams: () => mockParams,
}));

// Mock auth provider
jest.mock('@/providers/Providers', () => ({
  useAuth: jest.fn(),
}));

// Mock Supabase with proper query chain
jest.mock('@/lib/supabase', () => ({
  __esModule: true,
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    })),
    auth: {
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

// Mock child components
jest.mock('../PodcastHeader', () => {
  return function MockPodcastHeader({ podcast }: { podcast: { title?: string } }) {
    return <div data-testid="podcast-header">Header: {podcast?.title}</div>;
  };
});

jest.mock('../PodcastStats', () => {
  return function MockPodcastStats({ episodeCount }: { episodeCount: number }) {
    return <div data-testid="podcast-stats">Episodes: {episodeCount}</div>;
  };
});

jest.mock('../PodcastRSSSection', () => {
  return function MockPodcastRSSSection({ podcast }: { podcast: { title?: string } }) {
    return <div data-testid="podcast-rss-section">RSS: {podcast?.title}</div>;
  };
});

jest.mock('../PodcastActions', () => {
  return function MockPodcastActions() {
    return <div data-testid="podcast-actions">Actions</div>;
  };
});

jest.mock('../episodes/EpisodesList', () => {
  return function MockEpisodesList({ episodes }: { episodes?: unknown[] }) {
    return <div data-testid="episodes-list">Episodes: {episodes?.length || 0}</div>;
  };
});

jest.mock('@/components/ui/LoadingSpinner', () => {
  return function MockLoadingSpinner({ message }: { message?: string }) {
    return <div data-testid="loading-spinner">{message}</div>;
  };
});

describe('PodcastDetailView', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockPodcast = {
    id: 'test-podcast-id',
    title: 'Test Podcast',
    description: 'Test Description',
    author: 'Test Author',
    user_id: 'user-123'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    // Patch supabase.from('podcasts')...select().eq().eq().single() to return mockPodcast
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'podcasts') {
        // Support chained .select().eq().eq().single() with Promises
        const chain = {
          select: () => chain,
          eq: () => chain,
          single: () => Promise.resolve({ data: mockPodcast }),
          maybeSingle: () => Promise.resolve({ data: mockPodcast }),
        };
        return chain;
      }
      // fallback for other tables
      const fallback = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
      };
      return fallback;
    });
  });

  it('should show loading spinner initially', () => {
    render(<PodcastDetailView podcastId="test-podcast-id" />);
    expect(screen.getByTestId('loading-spinner')).toBeTruthy();
    expect(screen.getByText('Loading podcast...')).toBeTruthy();
  });

  it('should render podcast details when loaded successfully', async () => {
    render(<PodcastDetailView podcastId="test-podcast-id" />);
    await waitFor(() => {
      expect(screen.getByTestId('podcast-header')).toBeTruthy();
    });
    expect(screen.getByText('Header: Test Podcast')).toBeTruthy();
  });
});
