import { render, screen, waitFor } from '@testing-library/react';
import PodcastDetailView from '../PodcastDetailView';
import { useAuth } from '@/providers/Providers';

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
const mockSingle = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSupabaseQuery = {
  select: mockSelect,
};

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => mockSupabaseQuery),
  }
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
    
    // Set up default chain
    mockSelect.mockReturnValue({
      eq: mockEq
    });
    mockEq.mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: mockSingle
      }),
      single: mockSingle
    });
  });

  it('should show loading spinner initially', () => {
    // Mock hanging promise to test loading state
    mockSingle.mockImplementation(() => new Promise(() => {}));

    render(<PodcastDetailView />);

    expect(screen.getByTestId('loading-spinner')).toBeTruthy();
    expect(screen.getByText('Loading podcast...')).toBeTruthy();
  });

  it('should render podcast details when loaded successfully', async () => {
    // Mock successful podcast fetch, then count fetch, then analytics
    mockSingle
      .mockResolvedValueOnce({ data: mockPodcast, error: null })
      .mockResolvedValueOnce({ count: 2, error: null })
      .mockResolvedValueOnce({ data: [], error: null });

    render(<PodcastDetailView />);

    await waitFor(() => {
      expect(screen.getByTestId('podcast-header')).toBeTruthy();
    });

    expect(screen.getByText('Header: Test Podcast')).toBeTruthy();
  });
});
