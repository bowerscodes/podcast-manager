import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import PodcastCard from '@/components/podcasts/PodcastCard';
import { Podcast } from '@/types/podcast';
import { supabase } from '@/lib/supabase';

// Mock Next.js router
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock HeroUI components
jest.mock('@heroui/card', () => ({
  Card: ({ children, className, isPressable, onPress, ...props }: { children: React.ReactNode; className?: string; isPressable?: boolean; onPress?: () => void; [key: string]: unknown }) => (
    <div 
      className={className} 
      onClick={isPressable ? onPress : undefined}
      role={isPressable ? "button" : undefined}
      tabIndex={isPressable ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  ),
  CardHeader: ({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: unknown }) => (
    <div className={className} {...props}>{children}</div>
  ),
  CardBody: ({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: unknown }) => (
    <div className={className} {...props}>{children}</div>
  ),
  CardFooter: ({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: unknown }) => (
    <div className={className} {...props}>{children}</div>
  ),
}));

jest.mock('@heroui/image', () => ({
  Image: ({ alt, src, className }: { alt: string; src: string; className?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} className={className} />
  ),
}));

// Mock the defaultArtwork function
jest.mock('@/lib/data', () => ({
  defaultArtwork: () => <div data-testid="default-artwork">Default Artwork</div>,
}));

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

describe('PodcastCard', () => {
  const mockPodcast: Podcast = {
    id: '1',
    title: 'Test Podcast',
    description: 'This is a test podcast description that should be displayed in the card',
    author: 'Test Author',
    email: 'test@example.com',
    language: 'en',
    categories: ['Technology'],
    artwork: 'https://example.com/artwork.jpg',
    user_id: 'user1',
    podcast_name: 'test-podcast', // Added for new route
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    explicit: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render podcast title', () => {
    render(<PodcastCard podcast={mockPodcast} />);
    
    expect(screen.getByText('Test Podcast')).toBeTruthy();
  });

  it('should render podcast description', () => {
    render(<PodcastCard podcast={mockPodcast} />);
    
    expect(screen.getByText(/This is a test podcast description/)).toBeTruthy();
  });

  it('should render podcast artwork when provided', () => {
    render(<PodcastCard podcast={mockPodcast} />);
    
    const image = screen.getByAltText('podcast artwork for Test Podcast');
    expect(image).toBeTruthy();
    expect(image.getAttribute('src')).toBe('https://example.com/artwork.jpg');
  });

  it('should render default artwork when no artwork is provided', () => {
    const podcastWithoutArtwork = {
      ...mockPodcast,
      artwork: ''
    };

    render(<PodcastCard podcast={podcastWithoutArtwork} />);
    
    // The default artwork is a React component with FaPodcast icon
    // We can check for the default artwork test id
    const defaultArtwork = screen.getByTestId('default-artwork');
    expect(defaultArtwork).toBeTruthy();
    expect(defaultArtwork.textContent).toBe('Default Artwork');
  });

  it('should navigate to podcast detail when clicked', async () => {
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { username: 'user1' } })
            })
          })
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
      };
    });

    await act(async () => {
      render(<PodcastCard podcast={mockPodcast} />);
    });
    const card = screen.getByRole('button');
    // Wait for the profile state to be set (flush microtasks)
    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      fireEvent.click(card);
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(`/user1/${mockPodcast.podcast_name}`);
    });
  });

  it('should truncate long descriptions', () => {
    const podcastWithLongDescription = {
      ...mockPodcast,
      description: 'This is a very long podcast description that should be truncated because it exceeds the maximum length limit set by the component'
    };

    render(<PodcastCard podcast={podcastWithLongDescription} />);
    
    const description = screen.getByText(/This is a very long podcast description/);
    
    // Check that the description element has the line-clamp-2 class for CSS truncation
    expect(description).toHaveClass('line-clamp-2');
    
    // The full text should still be present in textContent (CSS line-clamp doesn't modify text content)
    expect(description.textContent).toBe(podcastWithLongDescription.description);
  });

  it('should not truncate short descriptions', () => {
    const podcastWithShortDescription = {
      ...mockPodcast,
      description: 'Short description'
    };

    render(<PodcastCard podcast={podcastWithShortDescription} />);
    
    const description = screen.getByText('Short description');
    expect(description.textContent).toBe('Short description');
    expect(description.textContent).not.toContain('...');
  });

  it('should have proper accessibility attributes', () => {
    render(<PodcastCard podcast={mockPodcast} />);
    
    const card = screen.getByRole('button');
    expect(card).toBeTruthy();
    
    const image = screen.getByAltText('podcast artwork for Test Podcast');
    expect(image.getAttribute('alt')).toBe('podcast artwork for Test Podcast');
  });

  it('should apply proper CSS classes', () => {
    render(<PodcastCard podcast={mockPodcast} />);
    
    const card = screen.getByRole('button');
    expect(card.className).toContain('podcast-card');
    expect(card.className).toContain('group');
  });

  it('should handle special characters in title and description', () => {
    const podcastWithSpecialChars = {
      ...mockPodcast,
      title: 'Podcast & "Special" Characters <Test>',
      description: 'Description with & special "characters" <tags>',
      podcast_name: 'special-podcast', // ensure valid podcast_name for route
    };

    render(<PodcastCard podcast={podcastWithSpecialChars} />);
    
    expect(screen.getByText('Podcast & "Special" Characters <Test>')).toBeTruthy();
    expect(screen.getByText(/Description with & special "characters" <tags>/)).toBeTruthy();
  });
});
