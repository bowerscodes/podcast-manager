import { render, screen, waitFor } from '@testing-library/react';
import PodcastDetailView from '../PodcastDetailView';
import { useAuth } from '@/providers/Providers';
import { PodcastQueries } from '@/lib/queries/podcast-queries';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock auth provider
jest.mock('@/providers/Providers', () => ({
  useAuth: jest.fn(),
}));

// Mock PodcastQueries
jest.mock('@/lib/queries/podcast-queries', () => ({
  PodcastQueries: {
    getUserPodcastWithStats: jest.fn(),
  },
}));

// Mock useAnalytics hook
jest.mock('@/hooks/useAnalytics', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    analytics: {
      totalDownloads: 0,
      uniqueListeners: 0,
      platformBreakdown: [],
    },
    loading: false,
  })),
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
  return function MockEpisodesList() {
    return <div data-testid="episodes-list">Episodes List</div>;
  };
});

jest.mock('@/components/ui/LoadingSpinner', () => {
  return function MockLoadingSpinner({ message }: { message?: string }) {
    return <div data-testid="loading-spinner">{message}</div>;
  };
});

jest.mock('@/components/ui/ExpandableContent', () => {
  return function MockExpandableContent({ 
    children, 
    title 
  }: { 
    children: React.ReactNode;
    title: string;
  }) {
    return (
      <div data-testid="expandable-content">
        <h3>{title}</h3>
        {children}
      </div>
    );
  };
});

describe('PodcastDetailView', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockPodcast = {
    id: 'test-podcast-id',
    title: 'Test Podcast',
    description: 'Test Description',
    author: 'Test Author',
    user_id: 'user-123',
    artwork: 'https://example.com/artwork.jpg',
    categories: ['Technology'],
    explicit: false,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-02'),
    email: 'test@example.com',
    website: 'https://example.com',
    language: 'en',
  };

  const mockPodcastData = {
    podcast: mockPodcast,
    episodeCount: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ 
      user: mockUser, 
      loading: false 
    });
    (PodcastQueries.getUserPodcastWithStats as jest.Mock).mockResolvedValue(mockPodcastData);
  });

  it('should show loading spinner while checking auth', () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      user: null, 
      loading: true 
    });

    render(<PodcastDetailView podcastId="test-podcast-id" />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
  });

  it('should redirect to home when user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      user: null, 
      loading: false 
    });

    render(<PodcastDetailView podcastId="test-podcast-id" />);
    
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('should show loading spinner while fetching podcast', () => {
    render(<PodcastDetailView podcastId="test-podcast-id" />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading podcast...')).toBeInTheDocument();
  });

  it('should render podcast details when loaded successfully', async () => {
    render(<PodcastDetailView podcastId="test-podcast-id" />);
    
    await waitFor(() => {
      expect(screen.getByTestId('podcast-header')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Header: Test Podcast')).toBeInTheDocument();
    expect(screen.getByTestId('podcast-stats')).toBeInTheDocument();
    expect(screen.getByTestId('episodes-list')).toBeInTheDocument();
    expect(screen.getByTestId('podcast-rss-section')).toBeInTheDocument();
    expect(screen.getByTestId('podcast-actions')).toBeInTheDocument();
  });

  it('should show not found message when podcast does not exist', async () => {
    (PodcastQueries.getUserPodcastWithStats as jest.Mock).mockResolvedValue(null);

    render(<PodcastDetailView podcastId="test-podcast-id" />);
    
    await waitFor(() => {
      expect(screen.getByText('Podcast Not Found')).toBeInTheDocument();
    });
    
    expect(screen.getByText("This podcast doesn't exist or you don't have access to it.")).toBeInTheDocument();
  });

  it('should call PodcastQueries with correct parameters', async () => {
    render(<PodcastDetailView podcastId="test-podcast-id" />);
    
    await waitFor(() => {
      expect(PodcastQueries.getUserPodcastWithStats).toHaveBeenCalledWith(
        'test-podcast-id',
        'user-123'
      );
    });
  });

  it('should handle fetch errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    (PodcastQueries.getUserPodcastWithStats as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch')
    );

    render(<PodcastDetailView podcastId="test-podcast-id" />);
    
    await waitFor(() => {
      expect(screen.getByText('Podcast Not Found')).toBeInTheDocument();
    });

    consoleError.mockRestore();
  });
});
